#!/usr/bin/env node

// External imports
import * as dotenv from "dotenv";
import sql from "mssql";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Internal imports
import { UpdateDataTool } from "./tools/UpdateDataTool.js";
import { InsertDataTool } from "./tools/InsertDataTool.js";
import { ReadDataTool } from "./tools/ReadDataTool.js";
import { CreateTableTool } from "./tools/CreateTableTool.js";
import { CreateIndexTool } from "./tools/CreateIndexTool.js";
import { ListTableTool } from "./tools/ListTableTool.js";
import { DropTableTool } from "./tools/DropTableTool.js";
import { DefaultAzureCredential, InteractiveBrowserCredential } from "@azure/identity";
import { DescribeTableTool } from "./tools/DescribeTableTool.js";

// MSSQL Database connection configuration
// const credential = new DefaultAzureCredential();

// Globals for connection and token reuse
let globalSqlPool: sql.ConnectionPool | null = null;
let globalAccessToken: string | null = null;
let globalTokenExpiresOn: Date | null = null;

// Function to create SQL config with fresh access token, returns token and expiry
export async function createSqlConfig(): Promise<{ config: sql.config, token: string | null, expiresOn: Date | null }> {
  const serverName = process.env.SERVER_NAME;
  const databaseName = process.env.DATABASE_NAME;
  const sqlUsername = process.env.SQL_USERNAME;
  const sqlPassword = process.env.SQL_PASSWORD;
  const trustServerCertificate = process.env.TRUST_SERVER_CERTIFICATE?.toLowerCase() === 'true';
  const connectionTimeout = process.env.CONNECTION_TIMEOUT ? parseInt(process.env.CONNECTION_TIMEOUT, 10) : 30;

  if (!serverName || !databaseName) {
    throw new Error('SERVER_NAME and DATABASE_NAME environment variables are required');
  }

  // Auto-detect authentication method based on environment variables
  const hasSqlUsername = !!sqlUsername;
  const hasSqlPassword = !!sqlPassword;

  // Validate SQL credentials if provided
  if (hasSqlUsername !== hasSqlPassword) {
    throw new Error('Both SQL_USERNAME and SQL_PASSWORD must be provided together for SQL Authentication');
  }

  // Use SQL Authentication if credentials are provided
  if (hasSqlUsername && hasSqlPassword) {
    // Validate credentials are non-empty
    if (!sqlUsername.trim() || !sqlPassword.trim()) {
      throw new Error('SQL_USERNAME and SQL_PASSWORD must be non-empty strings');
    }

    console.error('Using SQL Authentication');

    const config: sql.config = {
      server: serverName,
      database: databaseName,
      user: sqlUsername,
      password: sqlPassword,
      options: {
        encrypt: true,
        trustServerCertificate: trustServerCertificate,
      },
      connectionTimeout: connectionTimeout * 1000, // convert seconds to milliseconds
    };

    return {
      config,
      token: null, // No token for SQL auth
      expiresOn: null // No expiry for SQL auth
    };
  }

  // Use Azure AD Authentication (existing flow)
  console.error('Using Azure AD Authentication');

  const credential = new InteractiveBrowserCredential({
    redirectUri: 'http://localhost'
    // disableAutomaticAuthentication : true
  });
  const accessToken = await credential.getToken('https://database.windows.net/.default');

  return {
    config: {
      server: serverName,
      database: databaseName,
      options: {
        encrypt: true,
        trustServerCertificate
      },
      authentication: {
        type: 'azure-active-directory-access-token',
        options: {
          token: accessToken?.token!,
        },
      },
      connectionTimeout: connectionTimeout * 1000, // convert seconds to milliseconds
    },
    token: accessToken?.token!,
    expiresOn: accessToken?.expiresOnTimestamp ? new Date(accessToken.expiresOnTimestamp) : new Date(Date.now() + 30 * 60 * 1000)
  };
}

const updateDataTool = new UpdateDataTool();
const insertDataTool = new InsertDataTool();
const readDataTool = new ReadDataTool();
const createTableTool = new CreateTableTool();
const createIndexTool = new CreateIndexTool();
const listTableTool = new ListTableTool();
const dropTableTool = new DropTableTool();
const describeTableTool = new DescribeTableTool();

const server = new Server(
  {
    name: "mssql-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Read READONLY env variable
const isReadOnly = process.env.READONLY === "true";

// Request handlers

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: isReadOnly
    ? [listTableTool, readDataTool, describeTableTool] // todo: add searchDataTool to the list of tools available in readonly mode once implemented
    : [insertDataTool, readDataTool, describeTableTool, updateDataTool, createTableTool, createIndexTool, dropTableTool, listTableTool], // add all new tools here
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    let result;
    switch (name) {
      case insertDataTool.name:
        result = await insertDataTool.run(args);
        break;
      case readDataTool.name:
        result = await readDataTool.run(args);
        break;
      case updateDataTool.name:
        result = await updateDataTool.run(args);
        break;
      case createTableTool.name:
        result = await createTableTool.run(args);
        break;
      case createIndexTool.name:
        result = await createIndexTool.run(args);
        break;
      case listTableTool.name:
        result = await listTableTool.run(args);
        break;
      case dropTableTool.name:
        result = await dropTableTool.run(args);
        break;
      case describeTableTool.name:
        if (!args || typeof args.tableName !== "string") {
          return {
            content: [{ type: "text", text: `Missing or invalid 'tableName' argument for describe_table tool.` }],
            isError: true,
          };
        }
        result = await describeTableTool.run(args as { tableName: string });
        break;
      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    // Log error for debugging
    console.error('Tool execution error:', error instanceof Error ? error.message : String(error));

    // Return generic error to client
    return {
      content: [{ type: "text", text: "An error occurred while executing the database operation. Check server logs for details." }],
      isError: true,
    };
  }
});

// Server startup
async function runServer() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error) {
    console.error("Fatal error running server:", error);
    process.exit(1);
  }
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});

// Connect to SQL only when handling a request

async function ensureSqlConnection() {
  const usingSqlAuth = !!process.env.SQL_USERNAME;

  if (usingSqlAuth) {
    // SQL Authentication: no token refresh needed, just check connection
    if (globalSqlPool && globalSqlPool.connected) {
      return;
    }

    // Need to establish connection
    try {
      const { config } = await createSqlConfig();

      // Close old pool if exists
      if (globalSqlPool && globalSqlPool.connected) {
        await globalSqlPool.close();
      }

      globalSqlPool = await sql.connect(config);
    } catch (error) {
      // Sanitize error message - remove potential credentials
      const errorMsg = error instanceof Error ? error.message : String(error);
      const sanitized = errorMsg
        .replace(/password[^;,\s]*/gi, 'password=***')
        .replace(/pwd[^;,\s]*/gi, 'pwd=***');

      // Log sanitized error to stderr for debugging
      console.error('SQL Authentication connection failed:', sanitized);

      // Return generic error to caller (no information disclosure)
      throw new Error('Database connection failed. Verify SQL_USERNAME, SQL_PASSWORD, and server connectivity.');
    }
  } else {
    // Azure AD Authentication: check token validity and refresh if needed
    if (
      globalSqlPool &&
      globalSqlPool.connected &&
      globalAccessToken &&
      globalTokenExpiresOn &&
      globalTokenExpiresOn > new Date(Date.now() + 2 * 60 * 1000) // 2 min buffer
    ) {
      return;
    }

    // Get a new token and reconnect
    try {
      const { config, token, expiresOn } = await createSqlConfig();
      globalAccessToken = token;
      globalTokenExpiresOn = expiresOn;

      // Close old pool if exists
      if (globalSqlPool && globalSqlPool.connected) {
        await globalSqlPool.close();
      }

      globalSqlPool = await sql.connect(config);
    } catch (error) {
      // Log sanitized error to stderr
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Azure AD Authentication failed:', errorMsg);

      // Return generic error to caller
      throw new Error('Database connection failed. Verify Azure AD authentication and server connectivity.');
    }
  }
}

// Patch all tool handlers to ensure SQL connection before running
function wrapToolRun(tool: { run: (...args: any[]) => Promise<any> }) {
  const originalRun = tool.run.bind(tool);
  tool.run = async function (...args: any[]) {
    await ensureSqlConnection();
    return originalRun(...args);
  };
}

[insertDataTool, readDataTool, updateDataTool, createTableTool, createIndexTool, dropTableTool, listTableTool, describeTableTool].forEach(wrapToolRun);
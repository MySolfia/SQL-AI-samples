import sql from "mssql";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export class DropTableTool implements Tool {
  [key: string]: any;
  name = "drop_table";
  description = "Drops a table from the MSSQL Database.";
  inputSchema = {
    type: "object",
    properties: {
      tableName: { type: "string", description: "Name of the table to drop" }
    },
    required: ["tableName"],
  } as any;

  async run(params: any) {
    try {
      const { tableName } = params;
      // Basic validation to prevent SQL injection
      if (!/^[\w\d_]+$/.test(tableName)) {
        throw new Error("Invalid table name.");
      }
      const query = `DROP TABLE [${tableName}]`;
      await new sql.Request().query(query);
      return {
        success: true,
        message: `Table '${tableName}' dropped successfully.`
      };
    } catch (error) {
      // Log actual error to stderr for debugging
      console.error('[DropTableTool] execution error:', error instanceof Error ? error.message : String(error));

      // Return generic error to MCP client (no information disclosure)
      return {
        success: false,
        message: "Failed to drop table. Verify the table exists and has no dependencies. Check server logs for details."
      };
    }
  }
}
import sql from "mssql";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export class CreateTableTool implements Tool {
  [key: string]: any;
  name = "create_table";
  description = "Creates a new table in the MSSQL Database with the specified columns.";
  inputSchema = {
    type: "object",
    properties: {
      tableName: { type: "string", description: "Name of the table to create" },
      columns: {
        type: "array",
        description: "Array of column definitions (e.g., [{ name: 'id', type: 'INT PRIMARY KEY' }, ...])",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Column name" },
            type: { type: "string", description: "SQL type and constraints (e.g., 'INT PRIMARY KEY', 'NVARCHAR(255) NOT NULL')" }
          },
          required: ["name", "type"]
        }
      }
    },
    required: ["tableName", "columns"],
  } as any;

  async run(params: any) {
    try {
      const { tableName, columns } = params;
      if (!Array.isArray(columns) || columns.length === 0) {
        throw new Error("'columns' must be a non-empty array");
      }
      const columnDefs = columns.map((col: any) => `[${col.name}] ${col.type}`).join(", ");
      const query = `CREATE TABLE [${tableName}] (${columnDefs})`;
      await new sql.Request().query(query);
      return {
        success: true,
        message: `Table '${tableName}' created successfully.`
      };
    } catch (error) {
      // Log actual error to stderr for debugging
      console.error('[CreateTableTool] execution error:', error instanceof Error ? error.message : String(error));

      // Return generic error to MCP client (no information disclosure)
      return {
        success: false,
        message: "Failed to create table. Verify your SQL syntax. Check server logs for details."
      };
    }
  }
}

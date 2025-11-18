import sql from "mssql";
import { Tool } from "@modelcontextprotocol/sdk/types.js";


export class DescribeTableTool implements Tool {
  [key: string]: any;
  name = "describe_table";
  description = "Describes the schema (columns and types) of a specified MSSQL Database table.";
  inputSchema = {
    type: "object",
    properties: {
      tableName: { type: "string", description: "Name of the table to describe" },
    },
    required: ["tableName"],
  } as any;

  async run(params: { tableName: string }) {
    try {
      const { tableName } = params;
      const request = new sql.Request();
      const query = `SELECT COLUMN_NAME as name, DATA_TYPE as type FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @tableName`;
      request.input("tableName", sql.NVarChar, tableName);
      const result = await request.query(query);
      return {
        success: true,
        columns: result.recordset,
      };
    } catch (error) {
      // Log actual error to stderr for debugging
      console.error('DescribeTableTool execution error:', error instanceof Error ? error.message : String(error));

      // Return generic error to MCP client (no information disclosure)
      return {
        success: false,
        message: "Failed to describe table. Verify the table exists and you have permissions. Check server logs for details.",
      };
    }
  }
}

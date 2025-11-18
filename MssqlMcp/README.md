# MCP Server for SQL Server

## Note for Running
Use the Node version. It currently requires a version of Node prior to v24, I am using "nvm" to manage my Node versions and run it with v23.11.0. If you run it with anything newer it errors out at startup.

## Environment Variables to Set
 SQL Authentication

  Set these environment variables:
  SQL_USERNAME=your_username
  SQL_PASSWORD=your_password
  SERVER_NAME=your-server.database.windows.net
  DATABASE_NAME=your_database
  TRUST_SERVER_CERTIFICATE=true
  READONLY=true

  Azure AD Authentication (default)

  Simply don't set SQL_USERNAME and SQL_PASSWORD:
  SERVER_NAME=your-server.database.windows.net
  DATABASE_NAME=your_database

## Example of the command to add this MCP server to your setup. Replace the path etc of course.

> claude mcp add --transport stdio mssql --env SERVER_NAME=10.50.2.10 DATABASE_NAME=STARS READONLY=false TRUST_SERVER_CERTIFICATE=true SQL_USERNAME=rpatton_ssa SQL_PASSWORD='NoBadSqlHereMoveAlong' -- node /Users/robertpatton/Repositories/FASolutions/Forks/SQL-AI-samples/MssqlMcp/Node/dist/index.js

# MCP Server for SQL Server

## Note for Running
Use the Node version. It currently requires a version of Node prior to v24, I am using "nvm" to manage my Node versions and run it with v23. If you run it with anything newer it errors out at startup.

## Environment Variables to Set
 SQL Authentication

  Set these environment variables:
  SQL_USERNAME=your_username
  SQL_PASSWORD=your_password
  SERVER_NAME=your-server.database.windows.net
  DATABASE_NAME=your_database

  Azure AD Authentication (default)

  Simply don't set SQL_USERNAME and SQL_PASSWORD:
  SERVER_NAME=your-server.database.windows.net
  DATABASE_NAME=your_database

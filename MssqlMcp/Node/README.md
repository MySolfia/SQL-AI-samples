# MSSQL Database MCP  Server

<div align="center">
  <img src="./src/img/logo.png" alt="MSSQL Database MCP server logo" width="400"/>
</div>

> ⚠️ **EXPERIMENTAL USE ONLY** - This MCP Server is provided as an example for educational and experimental purposes only. It is NOT intended for production use. Please use appropriate security measures and thoroughly test before considering any kind of deployment.

## What is this? 🤔

This is a server that lets your LLMs (like Claude) talk directly to your MSSQL Database data! Think of it as a friendly translator that sits between your AI assistant and your database, making sure they can chat securely and efficiently.

### Quick Example
```text
You: "Show me all customers from New York"
Claude: *queries your MSSQL Database database and gives you the answer in plain English*
```

## How Does It Work? 🛠️

This server leverages the Model Context Protocol (MCP), a versatile framework that acts as a universal translator between AI models and databases. It supports multiple AI assistants including Claude Desktop and VS Code Agent.

### What Can It Do? 📊

- Run MSSQL Database queries by just asking questions in plain English
- Create, read, update, and delete data
- Manage database schema (tables, indexes)
- Secure connection handling
- Real-time data interaction

## Quick Start 🚀

### Prerequisites
- Node.js 14 or higher
- Claude Desktop or VS Code with Agent extension

### Set up project

1. **Install Dependencies**  
   Run the following command in the root folder to install all necessary dependencies:  
   ```bash
   npm install
   ```

2. **Build the Project**  
   Compile the project by running:  
   ```bash
   npm run build
   ```

## Authentication Methods

The MSSQL MCP Server supports two authentication methods:

### Azure AD Authentication (Default)

Azure AD authentication uses your Azure Active Directory credentials to connect to the database. This is the recommended method for Azure SQL Database as it provides:
- Enhanced security through managed identities
- No credential storage in configuration files
- Automatic token refresh

**When to use:** Connecting to Azure SQL Database with Azure AD-enabled accounts.

### SQL Authentication

SQL authentication uses traditional username and password credentials. This method is activated automatically when you provide SQL credentials.

**When to use:**
- Local SQL Server instances
- Environments where Azure AD is not available
- Legacy systems requiring SQL authentication

### Auto-Detection

The server automatically detects which authentication method to use:
- **Azure AD:** Used when `SQL_USERNAME` and `SQL_PASSWORD` are not set
- **SQL Authentication:** Used when both `SQL_USERNAME` and `SQL_PASSWORD` are provided

Both credentials must be provided together. Setting only one will result in an error.

### Security Recommendations

- Use Azure AD authentication whenever possible for enhanced security
- Never commit configuration files containing credentials to version control
- Use environment-specific configuration files (e.g., `.env.local`, `.env.production`)
- For SQL authentication, ensure passwords meet your organization's complexity requirements
- Set `READONLY: "true"` in production environments if only read access is needed
- Use connection encryption (enabled by default with `encrypt: true`)

## Configuration Setup

### Option 1: VS Code Agent Setup

1. **Install VS Code Agent Extension**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "Agent" and install the official Agent extension

2. **Create MCP Configuration File**
   - Create a `.vscode/mcp.json` file in your workspace
   - Add one of the following configurations based on your authentication method:

   **Azure AD Authentication:**
   ```json
   {
     "servers": {
       "mssql-nodejs": {
          "type": "stdio",
          "command": "node",
          "args": ["q:\\Repos\\SQL-AI-samples\\MssqlMcp\\Node\\dist\\index.js"],
          "env": {
            "SERVER_NAME": "your-server-name.database.windows.net",
            "DATABASE_NAME": "your-database-name",
            "READONLY": "false"
          }
        }
      }
   }
   ```

   **SQL Authentication:**
   ```json
   {
     "servers": {
       "mssql-nodejs": {
          "type": "stdio",
          "command": "node",
          "args": ["q:\\Repos\\SQL-AI-samples\\MssqlMcp\\Node\\dist\\index.js"],
          "env": {
            "SERVER_NAME": "your-server-name.database.windows.net",
            "DATABASE_NAME": "your-database-name",
            "SQL_USERNAME": "your-sql-username",
            "SQL_PASSWORD": "your-sql-password",
            "READONLY": "false"
          }
        }
      }
   }
   ```

3. **Alternative: User Settings Configuration**
   - Open VS Code Settings (Ctrl+,)
   - Search for "mcp"
   - Click "Edit in settings.json"
   - Add one of the following configurations:

   **Azure AD Authentication:**
   ```json
   {
    "mcp": {
        "servers": {
            "mssql": {
                "command": "node",
                "args": ["C:/path/to/your/Node/dist/index.js"],
                "env": {
                "SERVER_NAME": "your-server-name.database.windows.net",
                "DATABASE_NAME": "your-database-name",
                "READONLY": "false"
                }
            }
        }
    }
   }
   ```

   **SQL Authentication:**
   ```json
   {
    "mcp": {
        "servers": {
            "mssql": {
                "command": "node",
                "args": ["C:/path/to/your/Node/dist/index.js"],
                "env": {
                "SERVER_NAME": "your-server-name.database.windows.net",
                "DATABASE_NAME": "your-database-name",
                "SQL_USERNAME": "your-sql-username",
                "SQL_PASSWORD": "your-sql-password",
                "READONLY": "false"
                }
            }
        }
    }
   }
   ```

4. **Restart VS Code**
   - Close and reopen VS Code for the changes to take effect

5. **Verify MCP Server**
   - Open Command Palette (Ctrl+Shift+P)
   - Run "MCP: List Servers" to verify your server is configured
   - You should see "mssql" in the list of available servers

### Option 2: Claude Desktop Setup

1. **Open Claude Desktop Settings**
   - Navigate to File → Settings → Developer → Edit Config
   - Open the `claude_desktop_config` file

2. **Add MCP Server Configuration**
   Replace the content with one of the configurations below, updating the path and credentials:

   **Azure AD Authentication:**
   ```json
   {
     "mcpServers": {
       "mssql": {
         "command": "node",
         "args": ["C:/path/to/your/Node/dist/index.js"],
         "env": {
           "SERVER_NAME": "your-server-name.database.windows.net",
           "DATABASE_NAME": "your-database-name",
           "READONLY": "false"
         }
       }
     }
   }
   ```

   **SQL Authentication:**
   ```json
   {
     "mcpServers": {
       "mssql": {
         "command": "node",
         "args": ["C:/path/to/your/Node/dist/index.js"],
         "env": {
           "SERVER_NAME": "your-server-name.database.windows.net",
           "DATABASE_NAME": "your-database-name",
           "SQL_USERNAME": "your-sql-username",
           "SQL_PASSWORD": "your-sql-password",
           "READONLY": "false"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**
   - Close and reopen Claude Desktop for the changes to take effect

### Configuration Parameters

#### Required Parameters

- **SERVER_NAME**: Your MSSQL Database server name (e.g., `my-server.database.windows.net` for Azure SQL, or `localhost` for local instances)
- **DATABASE_NAME**: Your database name
- **Path**: Update the path in `args` to point to your actual project location

#### Authentication Parameters

**For Azure AD Authentication (default):**
- No additional parameters required
- Ensure you are logged in to Azure CLI or have Azure credentials configured

**For SQL Authentication:**
- **SQL_USERNAME**: SQL Server username (required for SQL auth)
- **SQL_PASSWORD**: SQL Server password (required for SQL auth)
- Both `SQL_USERNAME` and `SQL_PASSWORD` must be provided together

#### Optional Parameters

- **READONLY**: Set to `"true"` to restrict to read-only operations, `"false"` for full access (default: `"false"`)
- **CONNECTION_TIMEOUT**: Connection timeout in seconds (default: `30`)
- **TRUST_SERVER_CERTIFICATE**: Set to `"true"` to trust self-signed server certificates, useful for development environments or local SQL Server instances (default: `"false"`)

#### Configuration Examples

**Azure SQL Database with Azure AD:**
```json
"env": {
  "SERVER_NAME": "myserver.database.windows.net",
  "DATABASE_NAME": "mydatabase",
  "READONLY": "false"
}
```

**Azure SQL Database with SQL Authentication:**
```json
"env": {
  "SERVER_NAME": "myserver.database.windows.net",
  "DATABASE_NAME": "mydatabase",
  "SQL_USERNAME": "sqladmin",
  "SQL_PASSWORD": "YourSecurePassword123!",
  "READONLY": "false"
}
```

**Local SQL Server with SQL Authentication:**
```json
"env": {
  "SERVER_NAME": "localhost",
  "DATABASE_NAME": "mydatabase",
  "SQL_USERNAME": "sa",
  "SQL_PASSWORD": "YourSecurePassword123!",
  "TRUST_SERVER_CERTIFICATE": "true",
  "READONLY": "false"
}
```

## Sample Configurations

You can find sample configuration files in the `src/samples/` folder demonstrating both authentication methods:
- `claude_desktop_config.json` - For Claude Desktop (includes both Azure AD and SQL authentication examples)
- `vscode_agent_config.json` - For VS Code Agent (includes both Azure AD and SQL authentication examples)

Each sample file shows:
- **Azure AD Authentication:** Minimal configuration using Azure credentials
- **SQL Authentication:** Configuration with SQL username and password

## Usage Examples

Once configured, you can interact with your database using natural language:

- "Show me all users from New York"
- "Create a new table called products with columns for id, name, and price"
- "Update all pending orders to completed status"
- "List all tables in the database"

## Security Notes

- The server requires a WHERE clause for read operations to prevent accidental full table scans
- Update operations require explicit WHERE clauses for security
- Set `READONLY: "true"` in environments if you only need read access

## Troubleshooting

### Authentication Issues

#### How to Verify Which Authentication Method is Being Used

The server logs the authentication method to stderr when it starts. Check your AI assistant's logs:
- **Azure AD:** You'll see "Using Azure AD Authentication"
- **SQL Authentication:** You'll see "Using SQL Authentication"

#### Common Error Messages

**Error: "Both SQL_USERNAME and SQL_PASSWORD must be provided together for SQL Authentication"**
- **Cause:** Only one of `SQL_USERNAME` or `SQL_PASSWORD` is set
- **Solution:** Either provide both credentials for SQL auth, or remove both to use Azure AD auth

**Error: "SQL_USERNAME and SQL_PASSWORD must be non-empty strings"**
- **Cause:** SQL credentials are set but contain only whitespace
- **Solution:** Provide valid, non-empty username and password values

**Error: "Login failed for user"**
- **Cause:** Invalid SQL credentials or insufficient permissions
- **Solution:**
  - Verify username and password are correct
  - Ensure the SQL user has appropriate database permissions
  - Check if the user account is enabled and not locked

**Error: "Failed to acquire token from Azure AD"**
- **Cause:** Azure AD authentication is failing
- **Solution:**
  - Ensure you're logged in to Azure CLI (`az login`)
  - Verify your Azure account has access to the database
  - Check if your Azure AD token has expired
  - Ensure the database has Azure AD authentication enabled

**Error: "Connection timeout"**
- **Cause:** Cannot reach the database server
- **Solution:**
  - Verify `SERVER_NAME` is correct
  - Check network connectivity
  - Verify firewall rules allow your IP address
  - Increase `CONNECTION_TIMEOUT` if needed

**Error: "Self-signed certificate in certificate chain"**
- **Cause:** Server is using a self-signed certificate
- **Solution:** Set `TRUST_SERVER_CERTIFICATE: "true"` in your configuration (recommended for development only)

#### Authentication Troubleshooting Steps

1. **Verify configuration syntax:**
   - Ensure JSON is valid (no trailing commas, proper quotes)
   - Check that all paths use correct separators for your OS

2. **Check authentication method:**
   - Review server logs to confirm which auth method is active
   - Verify you've set the correct environment variables

3. **Test connection separately:**
   - For Azure AD: Test with Azure CLI (`az account show`)
   - For SQL Auth: Test with tools like Azure Data Studio or SSMS

4. **Review permissions:**
   - Ensure the user/identity has appropriate database permissions
   - Verify network security rules and firewall settings

5. **Enable detailed logging:**
   - Check your AI assistant's developer console for detailed error messages
   - Review SQL Server logs for authentication failures

#### Still Having Issues?

If you continue to experience problems:
- Verify the server builds successfully (`npm run build`)
- Check that Node.js version meets requirements (14+)
- Review the server's stderr output for detailed error messages
- Try the simplest possible configuration first (local database with SQL auth)

You should now have successfully configured the MCP server for MSSQL Database with your preferred AI assistant. This setup allows you to seamlessly interact with MSSQL Database through natural language queries!

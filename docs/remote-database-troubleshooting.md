# Remote Database Connection Troubleshooting Guide

This guide helps you resolve connection issues with your remote Supabase database backup script.

## 🔍 Quick Diagnosis

### Step 1: Check Environment Variables

Run the backup script to see which variables are missing:

```bash
just backup-remote-db
```

The script will show you exactly which environment variables are not set.

### Step 2: Get Your Supabase Connection Details

1. **Go to your Supabase project dashboard**
2. **Navigate to Settings > Database**
3. **Copy the connection string** (starts with `postgresql://`)

### Step 3: Extract Connection Parameters

Use our helper script to extract the parameters:

```bash
just extract-supabase-connection
```

This will prompt you to paste your connection string and extract the individual parameters.

## 🔧 Common Issues and Solutions

### Issue 1: "Connection parameters not found"

**Symptoms:**

- Script shows "NOT SET" for environment variables
- Error about missing connection parameters

**Solution:**

1. Add the required variables to your `.env` file:

```env
# Remote Database Connection Parameters
REMOTE_DB_HOST=your-host.supabase.co
REMOTE_DB_PORT=5432
REMOTE_DB_NAME=postgres
REMOTE_DB_USER=postgres
REMOTE_DB_PASSWORD=your-password
```

2. Use the extraction script:

```bash
just extract-supabase-connection
```

### Issue 2: "Failed to connect to remote database"

**Symptoms:**

- Connection timeout
- Authentication failed
- Host not found

**Solutions:**

#### A. Wrong Password

- **Check**: Verify password in Supabase dashboard
- **Fix**: Update `REMOTE_DB_PASSWORD` in `.env` file

#### B. Wrong Host

- **Check**: Host should end with `.supabase.co`
- **Fix**: Update `REMOTE_DB_HOST` in `.env` file

#### C. Network Issues

- **Check**: Try manual connection:

```bash
psql -h your-host.supabase.co -p 5432 -d postgres -U postgres
```

- **Fix**: Check firewall settings, VPN, or network connectivity

#### D. Supabase Project Issues

- **Check**: Ensure your Supabase project is active
- **Fix**: Verify project status in Supabase dashboard

### Issue 3: "Permission denied"

**Symptoms:**

- Connection works but backup fails
- Error about insufficient privileges

**Solutions:**

1. **Check database permissions** in Supabase dashboard
2. **Verify user role** has read access to public schema
3. **Contact Supabase support** if permissions are correct

### Issue 4: "Connection timeout"

**Symptoms:**

- Script hangs for 30+ seconds
- Network timeout error

**Solutions:**

1. **Check internet connection**
2. **Try from different network** (mobile hotspot)
3. **Check if Supabase is down** (status page)
4. **Increase timeout** in script if needed

## 📋 Step-by-Step Setup

### 1. Get Connection String from Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Settings > Database**
3. Copy the **Connection string** (URI format)
4. It should look like: `postgresql://postgres:[password]@[host]:5432/postgres`

### 2. Extract Parameters

```bash
just extract-supabase-connection
```

Paste your connection string when prompted.

### 3. Add to .env File

Add the extracted parameters to your `.env` file:

```env
# Remote Database Connection Parameters
REMOTE_DB_HOST=your-host.supabase.co
REMOTE_DB_PORT=5432
REMOTE_DB_NAME=postgres
REMOTE_DB_USER=postgres
REMOTE_DB_PASSWORD=your-actual-password
```

### 4. Test Connection

```bash
just backup-remote-db
```

## 🔍 Debugging Commands

### Manual Connection Test

Test the connection manually:

```bash
psql -h your-host.supabase.co -p 5432 -d postgres -U postgres
```

### Check Environment Variables

```bash
echo "Host: $REMOTE_DB_HOST"
echo "Port: $REMOTE_DB_PORT"
echo "Database: $REMOTE_DB_NAME"
echo "User: $REMOTE_DB_USER"
echo "Password: ${REMOTE_DB_PASSWORD:+'SET'}"
```

### Test with Connection String

If you have the full connection string, test it directly:

```bash
psql "postgresql://postgres:password@host:5432/postgres"
```

## 🚨 Emergency Solutions

### If Nothing Works

1. **Check Supabase Status**: Visit [status.supabase.com](https://status.supabase.com)
2. **Contact Support**: Use Supabase support if project is down
3. **Alternative Method**: Use Supabase dashboard to export data
4. **Manual Backup**: Use pgAdmin or other PostgreSQL tools

### Reset Configuration

If you need to start over:

```bash
# Remove current .env file
rm .env

# Create fresh .env from example
cp env.example .env

# Run setup again
just extract-supabase-connection
```

## 📞 Getting Help

### Before Contacting Support

1. **Check this troubleshooting guide**
2. **Run the debug commands** above
3. **Test manual connection** with psql
4. **Verify Supabase project status**

### Useful Information to Provide

When asking for help, include:

- **Error message** from the script
- **Environment variables** (without password)
- **Supabase project URL**
- **Connection string** (with password hidden)
- **Operating system** and version

### Support Channels

- **GitHub Issues**: For script-related problems
- **Supabase Support**: For database connection issues
- **Team Chat**: For internal project issues

## 🔄 Regular Maintenance

### Monthly Checks

1. **Test backup script** monthly
2. **Update connection details** if changed
3. **Verify Supabase project** is still active
4. **Check backup file sizes** for anomalies

### Quarterly Tasks

1. **Review backup retention** policy
2. **Test restore procedures**
3. **Update documentation** if needed
4. **Review security** of connection details

---

_This guide should be updated as new issues are discovered and resolved._

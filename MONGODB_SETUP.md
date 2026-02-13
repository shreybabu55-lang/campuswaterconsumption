# MongoDB Setup Guide for Windows

## Option 1: Install MongoDB (Recommended for Development)

### Step 1: Download MongoDB
1. Go to https://www.mongodb.com/try/download/community
2. Select "Windows x64" version
3. Download the MSI installer

### Step 2: Install MongoDB
1. Run the downloaded `.msi` file
2. Choose "Complete" installation
3. **Important**: Check "Install MongoDB as a Service"
4. Keep the default data and log directories
5. Optionally install MongoDB Compass (GUI tool)

### Step 3: Verify Installation
Open a new PowerShell window and run:
```powershell
mongod --version
```

If this works, MongoDB is installed! Skip to "Start MongoDB" below.

---

## Option 2: Use MongoDB Atlas (Cloud Database - No Installation Needed)

If you prefer not to install MongoDB locally:

### Step 1: Create Free MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account
3. Create a free M0 cluster (takes 3-5 minutes)

### Step 2: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### Step 3: Update Backend Configuration
Edit `backend/.env`:
```env
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/water_management?retryWrites=true&w=majority
```

### Step 4: Install Additional Dependencies
```powershell
cd backend
npm install mongodb
```

---

## Start MongoDB (Local Installation)

### If MongoDB was installed as a service:
It should already be running! You can skip this step.

### If not installed as a service:
Create a data directory and start manually:
```powershell
# Create data directory
mkdir C:\data\db

# Start MongoDB
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath C:\data\db
```

*(Note: Adjust the version number if different)*

---

## Quick Test

After MongoDB is running, test the connection:
```powershell
cd backend
npm run seed
```

If this works, you're all set! Otherwise, use MongoDB Atlas.

---

## Recommended: MongoDB Atlas for Quick Start

Since local MongoDB setup can be tricky on Windows, I recommend using **MongoDB Atlas** (free cloud database):
- ✅ No installation needed
- ✅ Always accessible
- ✅ Free tier available
- ✅ Automatic backups

Just update the connection string in `backend/.env` and you're ready to go!

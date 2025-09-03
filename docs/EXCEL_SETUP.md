# Excel Dashboard Setup

## Problem Solved ✅
- **No more browser freezing** when loading Excel files
- **Server-side processing** handles large Excel files efficiently  
- **Real-time data** from your actual Excel file

## Quick Start

### 1. Install Server Dependencies
```bash
npm install express cors xlsx
```

### 2. Copy Your Excel File
Copy `Supplier_Info_2023to2025.xlsx` to the project root directory (same folder as `server.js`)

### 3. Start API Server
```bash
node server.js
```
You should see:
```
🚀 Excel API Server running on http://localhost:3001
📊 Dashboard data available at http://localhost:3001/api/dashboard-data
```

### 4. Start Dashboard (in new terminal)
```bash
npm run dev
```

### 5. Open Dashboard
- Dashboard: http://localhost:3000
- API Health: http://localhost:3001/api/health

## How It Works

Instead of processing Excel files in the browser (which causes freezing), we now:

1. **Server processes Excel** - Node.js server reads and processes the Excel file once
2. **Cache the results** - Processed data is cached in memory for fast access
3. **API endpoints** - Dashboard fetches data via HTTP API calls
4. **No blocking** - Browser never handles heavy Excel processing

## Column Mapping

Your Excel columns are automatically mapped:
- `BUSINESS UNIT` → `businessUnit`
- `OPERATING UNIT` → `operatingUnit` 
- `VENDOR ID` → `id`
- `VENDOR DESCR` → `vendorName`
- `ACCOUNT` → `account`
- ` AMOUNT ` → `amount`
- `PO DATE` → `date`
- `PO TYPE` → `poType`
- `MONTH` → `month`
- `YEAR` → `year`

## Troubleshooting

### API Server Won't Start
- Make sure dependencies are installed: `npm install express cors xlsx`
- Check if port 3001 is available
- Verify Excel file exists in the correct location

### Dashboard Shows Mock Data
- Ensure API server is running on http://localhost:3001
- Check browser console (F12) for connection errors
- Verify Excel file has the correct column headers

### Excel File Not Found
The server looks for your Excel file in these locations:
1. `./public/data/Supplier_Info_2023to2025.xlsx`
2. `./data/Supplier_Info_2023to2025.xlsx`  
3. `./Supplier_Info_2023to2025.xlsx`

## Architecture

```
Browser Dashboard (React/Vite)     Excel API Server (Node.js/Express)
├── No Excel processing            ├── Reads Excel file with XLSX
├── Makes HTTP requests            ├── Processes & caches data  
├── Never freezes                  ├── Serves via REST API
└── Fast & responsive              └── Handles heavy operations
```

## Files Created

- `server.js` - Express server that processes Excel
- `src/services/apiDataService.ts` - Client service to fetch from API
- Updated `src/services/dataService.ts` - Uses API instead of client Excel processing

This solution is based on the working `fmis_report_query_dashboard` project which uses the same server-side approach.

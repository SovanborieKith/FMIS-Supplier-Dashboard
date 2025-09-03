# Excel File Integration Guide

This dashboard can read data directly from Excel files placed in the `public/data/` folder. 

## 📁 File Structure

Place your Excel files in the `public/data/` folder with these names:

```
public/data/
├── purchase_orders.xlsx     # Purchase orders data
├── vendors.xlsx            # Vendors data  
└── operating_units.xlsx    # Operating units data
```

## 📊 Excel File Formats

### 1. Purchase Orders (`purchase_orders.xlsx`)

**Required columns:**
- `PO ID` - Purchase order identifier
- `Operating Unit` - Operating unit code
- `Vendor Code` - Vendor identifier  
- `Vendor Name` - Full vendor name
- `Account` - Account code
- `Amount` - Purchase amount (numeric)
- `Date` - Purchase order date

**Optional columns:**
- `Currency` - Currency code (defaults to USD)
- `Status` - Order status (pending, approved, completed, cancelled)

**Example:**
| PO ID | Operating Unit | Vendor Code | Vendor Name | Account | Amount | Currency | Date | Status |
|-------|---------------|-------------|-------------|---------|---------|----------|------|---------|
| PO-001 | 1001 | V001 | KAMPUCHEA TELA LIMITED | 60015 | 125000 | USD | 2024-07-13 | completed |
| PO-002 | 1002 | V002 | M.R.H LIMITED CO.,LTD | 60020 | 98000 | USD | 2024-07-12 | approved |

### 2. Vendors (`vendors.xlsx`)

**Required columns:**
- `Vendor ID` - Unique vendor identifier
- `Vendor Name` - Full vendor name
- `Vendor Code` - Short vendor code

**Optional columns:**
- `Registration Date` - When vendor was registered
- `Status` - Vendor status (active, inactive)

**Example:**
| Vendor ID | Vendor Name | Vendor Code | Registration Date | Status |
|-----------|-------------|-------------|-------------------|---------|
| V001 | KAMPUCHEA TELA LIMITED | KTL | 2020-01-15 | active |
| V002 | M.R.H LIMITED CO.,LTD | MRH | 2021-03-22 | active |

### 3. Operating Units (`operating_units.xlsx`)

**Required columns:**
- `OU ID` - Operating unit identifier
- `OU Name` - Full operating unit name
- `OU Code` - Operating unit code

**Example:**
| OU ID | OU Name | OU Code |
|-------|---------|---------|
| 1001 | Operating Unit 1001 | 1001 |
| 1002 | Operating Unit 1002 | 1002 |

## 🔧 Column Mapping

The system automatically maps Excel columns to dashboard data fields. If your Excel files use different column names, you can modify the column mappings in:

`src/services/excelReader.ts` → `DEFAULT_COLUMN_MAPPINGS`

## 📋 Data Requirements

1. **Headers**: First row should contain column headers
2. **Data Types**: 
   - Dates: Excel date format or YYYY-MM-DD
   - Numbers: Numeric values (commas allowed)
   - Text: Any text format
3. **Required Fields**: Some columns are required (marked above)
4. **File Format**: `.xlsx` or `.xls` format

## 🚀 How to Use

1. **Prepare your Excel files** according to the formats above
2. **Copy files** to `public/data/` folder:
   ```
   - Copy purchase_orders.xlsx to public/data/
   - Copy vendors.xlsx to public/data/
   - Copy operating_units.xlsx to public/data/
   ```
3. **Refresh the dashboard** - data will load automatically
4. **Check browser console** for any import errors

## 🐛 Troubleshooting

### Common Issues:

1. **File not found**: Ensure files are in `public/data/` folder
2. **Column not mapped**: Check column names match exactly
3. **Date format errors**: Use Excel date format or YYYY-MM-DD
4. **Missing required fields**: Ensure all required columns have data

### Debug Steps:

1. Open browser developer tools (F12)
2. Check Console tab for error messages
3. Look for "Excel data loaded successfully" message
4. If errors appear, check file format and column names

## 📈 Features

When Excel files are loaded successfully, the dashboard will:

- **Calculate metrics** automatically from your data
- **Generate charts** based on actual purchase orders
- **Apply filters** to your real data
- **Show recent transactions** from your Excel files
- **Display vendor and OU information** from your data

## 💡 Tips

- **Start with one file**: Begin with just `purchase_orders.xlsx`
- **Check sample data**: Look at console logs to verify data loading
- **Use consistent formats**: Keep date and number formats consistent
- **Backup your files**: Keep copies of original Excel files
- **Test with small datasets** first before loading large files

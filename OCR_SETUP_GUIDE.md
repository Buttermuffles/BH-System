# OCR Integration Guide

This project supports **two OCR methods**: Local (Tesseract) and Online (Cloud APIs).

## Method 1: Local OCR (Default)

### What It Does
- Processes documents offline using **Tesseract OCR engine**
- Fast, no API calls needed, private data stays local
- Requires Python and Tesseract to be installed

### Setup

#### Windows Setup

**1. Install Python**
```powershell
winget install Python.Python.3.12
```

**2. Install Tesseract OCR**
```powershell
winget install UB-Mannheim.TesseractOCR
```

**3. Install Poppler (Required for PDF Processing)**
```powershell
winget install poppler
```

**Note:** If poppler is not in PATH, you can set `POPPLER_PATH` in `.env`:
```env
POPPLER_PATH="C:\Program Files\poppler\Library\bin"
```

**4. Install Python Dependencies**
```powershell
cd "c:\Users\johnx\OneDrive\Documents\REACT FOLDER\BH-System"
$pythonPath = "C:\Users\johnx\AppData\Local\Programs\Python\Python312\python.exe"
& $pythonPath -m pip install -r scripts/requirements.txt
```

**Note:** The requirements now include libraries for Word, Excel, PowerPoint, and other document formats:
- `python-docx` - Word documents (.docx)
- `openpyxl` - Excel files (.xlsx)
- `xlrd` - Old Excel format (.xls)
- `python-pptx` - PowerPoint (.pptx)
- `striprtf` - RTF files

**5. Configure .env**
```env
PYTHON_CMD="C:\Users\johnx\AppData\Local\Programs\Python\Python312\python.exe"
TESSERACT_CMD="C:\Program Files\Tesseract-OCR\tesseract.exe"
POPPLER_PATH="C:\Program Files\poppler\Library\bin"  # Optional: if poppler not in PATH
```

#### Linux/Mac Setup

**1. Install Tesseract**
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# macOS
brew install tesseract
```

**2. Install Poppler (Required for PDF Processing)**
```bash
# Ubuntu/Debian
sudo apt-get install poppler-utils

# macOS
brew install poppler
```

**3. Install Python Dependencies**
```bash
python3 -m pip install -r scripts/requirements.txt
```

**Note:** This installs libraries for Word, Excel, PowerPoint, and other document formats.

**4. Configure .env**
```env
PYTHON_CMD=python3
TESSERACT_CMD=/usr/bin/tesseract  # or /usr/local/bin/tesseract on Mac
# Poppler usually in PATH on Linux/Mac, no need to set POPPLER_PATH
```

### How It Works
1. User uploads document (PDF, Word, Excel, images, etc.) → Laravel controller
2. Controller calls `scripts/local_ocr.py` with file path
3. Python script:
   - For images/PDFs: Uses pytesseract + Tesseract engine (OCR)
   - For Word/Excel/PowerPoint: Extracts text directly from file structure
   - For text files: Reads content directly
4. Extracts text and saves to `storage/app/ocr_output/`
5. Returns text to React component for display

### Supported File Types
- **Images**: PNG, JPG, JPEG, TIFF, BMP, GIF, WebP (OCR)
- **PDFs**: Multi-page PDF documents (OCR)
- **Word**: .docx files (direct extraction), .doc (requires conversion)
- **Excel**: .xlsx, .xls files (direct extraction)
- **PowerPoint**: .pptx files (direct extraction), .ppt (requires conversion)
- **Text**: .txt, .csv, .rtf files (direct reading)
- **OpenDocument**: .odt, .ods, .odp (requires conversion to standard formats)

### Files
- `scripts/local_ocr.py` - Python OCR script
- `app/Http/Controllers/OcrController.php` - Backend handler
- `resources/js/Components/OcrUpload.jsx` - React upload component

---

## Method 2: Online OCR (Cloud-Based)

### What It Does
- Sends documents to cloud OCR service (Chandra, Google Vision, AWS Textract, etc.)
- Better accuracy for complex documents
- Requires API key and internet connection

### Supported Services

#### Chandra OCR (Default)
https://chandra-ocr.io/

**Setup:**
```env
CHANDRA_API_KEY=your_api_key_here
CHANDRA_ENDPOINT=https://api.chandra-ocr.com/v1/ocr
CHANDRA_AUTH_HEADER=Authorization
```

#### Alternative: Google Cloud Vision
```env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

#### Alternative: AWS Textract
```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

### How to Use
1. Obtain API key from your chosen service
2. Add credentials to `.env`
3. In React component, select "Online" method
4. Upload document → sent to cloud service
5. Results returned and displayed

### Files
- `app/Http/Controllers/OcrController.php` - `processOnlineOcr()` method
- `resources/js/Components/OcrUpload.jsx` - Method selector UI

---

## Using the OCR Component

### Basic Usage (Auto-Selects Local)
```jsx
<OcrUpload />
```

### Switching Methods
The component has a radio button selector:
- **Local**: Fast, offline, requires Tesseract installed
- **Online**: Better accuracy, requires API key

### Example Flow
1. Navigate to `/ocr-demo` (after login)
2. Select OCR method (Local or Online)
3. Upload a PDF or image
4. See extracted text displayed side-by-side with original document

---

## Testing

### Test Local OCR Directly
```bash
cd "path/to/BH-System"

# Windows
$pythonPath = "C:\Users\johnx\AppData\Local\Programs\Python\Python312\python.exe"
& $pythonPath scripts/local_ocr.py --input "storage/app/uploads/test.png" --output "storage/app/ocr_output"

# Linux/Mac
python3 scripts/local_ocr.py --input "storage/app/uploads/test.png" --output "storage/app/ocr_output"
```

### Check Results
```bash
# View extracted text
cat storage/app/ocr_output/test.txt

# View logs
cat storage/app/ocr_logs/local_ocr_*.log
```

---

## Troubleshooting

### "Python not found"
- Windows: Install from `python.org` or `winget install Python.Python.3.12`
- Linux: `sudo apt-get install python3`
- Set `PYTHON_CMD` in `.env`

### "Tesseract not found"
- Windows: Install with `winget install UB-Mannheim.TesseractOCR`
- Linux: `sudo apt-get install tesseract-ocr`
- Ensure Tesseract is in PATH or set `TESSERACT_CMD`

### "Poppler not found" or "Unable to get page count"
- Windows: Install with `winget install poppler`
- Linux: `sudo apt-get install poppler-utils`
- macOS: `brew install poppler`
- If not in PATH, set `POPPLER_PATH` in `.env` to the poppler bin directory

### Online OCR fails with "API key error"
- Verify `CHANDRA_API_KEY` in `.env`
- Check API endpoint URL is correct
- Ensure you have internet connection

### No text extracted from image
- Image might be too low quality
- Try local method (Tesseract) first
- Check file is valid PDF/image
- Look at log files for details

---

## Performance Comparison

| Feature | Local | Online |
|---------|-------|--------|
| Speed | Fast (< 5 sec) | Slow (5-30 sec) |
| Accuracy | Good (90-95%) | Excellent (95%+) |
| Cost | Free | Per-request fee |
| Privacy | Local data | Uploaded to cloud |
| Offline | Yes | No |
| Setup | Moderate | Easy |

---

## Configuration Reference

### .env Variables

```env
# Local OCR (Tesseract)
PYTHON_CMD=C:\Users\johnx\AppData\Local\Programs\Python\Python312\python.exe
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe

# Online OCR (Chandra)
CHANDRA_API_KEY=your_key_here
CHANDRA_ENDPOINT=https://api.chandra-ocr.com/v1/ocr
CHANDRA_AUTH_HEADER=Authorization

# Alternative: Google Cloud Vision
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Alternative: AWS Textract
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

---

## Next Steps

1. **Install dependencies** (Python, Tesseract)
2. **Configure .env** with paths/API keys
3. **Test locally** first: `php artisan serve`
4. **Navigate to** `/ocr-demo` and upload a test file
5. **Verify output** in `storage/app/ocr_output/`

Questions? Check logs at:
- Laravel: `storage/logs/laravel.log`
- OCR: `storage/app/ocr_logs/local_ocr_*.log`

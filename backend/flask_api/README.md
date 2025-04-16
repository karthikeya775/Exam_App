# PDF Metadata Extraction API

This Flask API is responsible for extracting metadata from PDF files using OCR technology.

## Requirements

- Python 3.7+
- Poppler (for PDF to image conversion)
- Tesseract OCR (for text extraction)

## Installation

1. Install Poppler:

   - For Windows: Download from https://github.com/oschwartz10612/poppler-windows/releases
   - Extract to a directory and update the `POPPLER_PATH` variable in app.py

2. Install Tesseract OCR:

   - For Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
   - Install and update the `TESSERACT_PATH` variable in app.py

3. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

## Configuration

Ensure the paths to Poppler and Tesseract are correctly set in the `app.py` file:

```python
POPPLER_PATH = r'C:\path\to\poppler\bin'  # Update this path
TESSERACT_PATH = r'C:\Program Files\Tesseract-OCR\tesseract.exe'  # Update this path
```

## Running the API

```
python app.py
```

The API will run on http://localhost:5001 by default.

## API Endpoints

### `/detect_details` (POST)

Extracts metadata from a PDF file:

- **Request**: Multipart form with a PDF file in the 'file' field
- **Response**: JSON with extracted details:
  ```json
  {
    "success": true,
    "course_code": "CSC101",
    "exam_type": "mid-semester",
    "year": 2023,
    "raw_ocr_text": "Extracted text from the PDF..."
  }
  ```

## Integration with Node.js Backend

The Node.js backend communicates with this API via the `flaskApiService.js` module.

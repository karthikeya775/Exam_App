# PDF OCR Question Paper Processor

This application processes PDF question papers using OCR to extract text and images. It provides a web interface for uploading PDFs and processes them to extract questions and metadata.

## Prerequisites

- Python 3.7 or higher
- Tesseract OCR engine
- Poppler (for pdf2image)

## Installation

1. Install Tesseract OCR:

   - Windows: Download and install from https://github.com/UB-Mannheim/tesseract/wiki
   - Linux: `sudo apt-get install tesseract-ocr`
   - Mac: `brew install tesseract`

2. Install Poppler:

   - Windows: Download and install from http://blog.alivate.com.au/poppler-windows/
   - Linux: `sudo apt-get install poppler-utils`
   - Mac: `brew install poppler`

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

1. Run the Flask application:

   ```bash
   python app.py
   ```

2. Open your web browser and navigate to `http://localhost:5000`

3. Upload a PDF file through the web interface

4. The application will process the PDF and create a text file containing the extracted text in the `uploads` directory

## Features

- PDF to image conversion
- OCR text extraction
- Web interface for file upload
- Error handling and user feedback
- Supports multiple page PDFs

## Project Structure

```
.
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── templates/
│   └── upload.html    # HTML template for upload page
└── uploads/           # Directory for uploaded files
```

## Troubleshooting

### File Paths and Permissions

If you encounter issues with file saving or metadata storage, check the following:

1. **Uploads Directory**: The application creates an `uploads` directory in the same folder as `app.py`. Ensure this directory exists and has write permissions:

   ```
   OCR_Chaitanya/
   ├── uploads/       # This directory must exist and be writable
   ├── app.py
   └── ...
   ```

2. **Metadata File**: The application creates and maintains a `document_metadata.json` file in the main directory. Ensure this file exists and has read/write permissions.

3. **Console Logs**: When the app starts, it performs checks on paths and permissions. Look at the console output for any error messages related to directory or file access.

4. **Poppler Path**: Ensure your Poppler path is correctly set in `app.py`. The current path is:

   ```python
   POPPLER_PATH = r'C:\Users\saika\Downloads\Release-24.08.0-0\poppler-24.08.0\Library\bin'
   ```

   Update this path if Poppler is installed in a different location on your system.

5. **Tesseract Path**: Ensure your Tesseract path is correctly set in `app.py`:
   ```python
   TESSERACT_PATH = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
   ```
   Update this path if Tesseract is installed in a different location.

### Common Solutions

If metadata is not being stored or files are not being saved:

1. **Run as Administrator**: Try running the application with administrator privileges which may resolve permission issues.

2. **Check Disk Space**: Ensure you have enough disk space available for storing PDFs and extracted text.

3. **Antivirus Interference**: Some antivirus software may block file operations. Try temporarily disabling your antivirus or adding an exception for the application.

4. **Reset Metadata File**: If the JSON file is corrupted, delete it and restart the application. A new empty metadata file will be created automatically.

5. **Debug Output**: Look for detailed error messages in the terminal/command prompt where you're running the Flask app.

# Exam Paper Repository - Backend

This is the backend server for the Exam Paper Repository application. It provides APIs for uploading, searching, and downloading exam papers.

## Features

- User authentication and authorization
- Upload exam papers with metadata
- Search and filter exam papers
- Download exam papers
- Credit system for uploading and downloading papers
- OCR-based metadata extraction from PDF files

## Prerequisites

- Node.js (v14+)
- MongoDB
- Python 3.7+ (for OCR functionality)
- Tesseract OCR
- Poppler (for PDF to image conversion)

## Installation

1. Install Node.js dependencies:

   ```
   npm install
   ```

2. Set up the Flask API for OCR functionality:

   ```
   npm run setup:flask
   ```

3. Configure environment variables:
   Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/exam-papers
   JWT_SECRET=your_jwt_secret
   FLASK_API_URL=http://localhost:5001
   ```

## Running the Application

### Development

Run the backend server only:

```
npm run dev
```

Run the Flask API only:

```
npm run start:flask
```

Run both backend server and Flask API:

```
npm run dev:all
```

### Production

```
npm start
```

## Flask API for OCR

The application includes a Flask API for OCR-based metadata extraction from PDF files. This API is responsible for:

1. Converting PDF files to images
2. Performing OCR to extract text
3. Analyzing the text to detect course codes, exam types, and years
4. Providing the extracted metadata to the Node.js backend

### Flask API Setup

The Flask API requires additional dependencies:

1. Tesseract OCR:

   - For Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki

2. Poppler (for PDF to image conversion):
   - For Windows: Download from https://github.com/oschwartz10612/poppler-windows/releases

After installing these dependencies, update the paths in `flask_api/app.py`:

```python
POPPLER_PATH = r'C:\path\to\poppler\bin'  # Update this path
TESSERACT_PATH = r'C:\Program Files\Tesseract-OCR\tesseract.exe'  # Update this path
```

Then run the setup script:

```
npm run setup:flask
```

### Flask API Endpoints

- `POST /detect_details`: Extract metadata from a PDF file

## API Documentation

For detailed API documentation, please refer to the API documentation file.

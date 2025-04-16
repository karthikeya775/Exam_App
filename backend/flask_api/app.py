import os
import re
import json
from datetime import datetime
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from pdf2image import convert_from_path
import pytesseract
from PIL import Image
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create uploads directory if it doesn't exist
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Add poppler path configuration
POPPLER_PATH = r'C:\Users\saika\Downloads\Release-24.08.0-0\poppler-24.08.0\Library\bin'

# Add Tesseract path configuration
TESSERACT_PATH = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

# List of course codes to search for
COURSE_CODES = [
    # Original CS codes
    "CSI101", "CSI102", "CSC201", "CSC202", "CSC203", "CSC204", "CSC205", "CSC206",
    "CSC207", "CSC208", "CSC209", "CSC210", "CSC211", "CSC301", "CSC302", "CSC303",
    "CSC304", "CSC305", "CSC306", "CSC307", "CSC308", "CSC401", "CSC402", "CSC501",
    "CSC502", "CSC503", "CSC504", "CSC505", "CSC506", "CSC507", "CSC508", "CSC509",
    "CSC510", "CSC516", "CSC517", "CSC518", "CSC597", "CSC598", "CSC599", "CSS401",
    
    # Additional department codes
    "CSE201", "CSE202", "CSD401", "CSD402", "CSO302", "CSO303"
]

def detect_exam_type(text):
    """Detect the type of examination from the text"""
    text = text.lower()
    
    if any(term in text for term in ['end sem', 'end semester', 'end-sem', 'endsem']):
        return 'end-semester'
    elif any(term in text for term in ['mid sem', 'mid semester', 'mid-sem', 'midsem']):
        return 'mid-semester'
    elif any(term in text for term in ['quiz', 'quizz']):
        return 'quiz'
    
    return 'other'  # Default to other if not found

def find_course_code(text):
    """Search for course codes in the text, handling possible OCR variations"""
    
    # Clean up the text by removing extra spaces and normalizing characters
    text = ' '.join(text.split())
    
    logger.info(f"Searching for course code in text of length: {len(text)}")
    
    # Try direct regex pattern first
    course_code_pattern = r'(?:CS[ODIE]|CSD|CSE)\s*\d{3}'
    potential_direct_codes = re.findall(course_code_pattern, text)
    if potential_direct_codes:
        # Remove spaces and standardize
        cleaned_codes = [''.join(code.split()) for code in potential_direct_codes]
        logger.info(f"Found potential course codes with regex: {cleaned_codes}")
        
        # Check if any match our expected codes
        for cleaned_code in cleaned_codes:
            numeric_part = re.search(r'\d{3}', cleaned_code)
            if numeric_part:
                prefix = cleaned_code[:cleaned_code.index(numeric_part.group())]
                std_prefix = None
                
                # Standardize department prefixes
                if re.match(r'CS[0O]', prefix):
                    std_prefix = 'CSO'
                elif re.match(r'CS[1I]', prefix):
                    std_prefix = 'CSI'
                elif re.match(r'CSD', prefix):
                    std_prefix = 'CSD'
                elif re.match(r'CSE', prefix):
                    std_prefix = 'CSE'
                else:
                    std_prefix = 'CSC'  # Default to CSC
                
                std_code = std_prefix + numeric_part.group()
                logger.info(f"Standardized {cleaned_code} to {std_code}")
                
                # Check if this standardized code is in our list
                if std_code in COURSE_CODES:
                    logger.info(f"Found matching course code: {std_code}")
                    return std_code
    
    # If no match found, look for partial matches
    logger.info("No exact course code match found. Looking for partial matches...")
    
    # Extract all word sequences that could be course codes
    potential_codes = re.findall(r'[A-Z]{2,3}\s*\d{3}', text)
    if potential_codes:
        logger.info(f"Potential course codes found: {potential_codes}")
        # Return the first potential match
        if len(potential_codes) > 0:
            cleaned_code = ''.join(potential_codes[0].split())
            logger.info(f"Using potential course code: {cleaned_code}")
            return cleaned_code
    
    logger.info("No course code found in the text")
    return ""

def extract_year(text):
    """Extract year from text, ignoring date formats"""
    # Look for 4-digit years between 2000 and current year + 1
    current_year = datetime.now().year
    
    # Pattern to match 4-digit years (2000-current+1)
    years = re.findall(r'\b20\d{2}\b', text)
    
    if years:
        # Convert to integers and filter valid years
        valid_years = [int(y) for y in years if 2000 <= int(y) <= current_year + 1]
        if valid_years:
            return max(valid_years)  # Return most recent valid year
    
    return current_year  # Default to current year if no valid year found

def detect_document_details(pdf_path):
    """Detect all document details from the PDF"""
    try:
        # Convert first page of PDF to image
        images = convert_from_path(pdf_path, poppler_path=POPPLER_PATH, first_page=1, last_page=1)
        
        if not images:
            raise Exception("Failed to convert PDF to image")
            
        # Perform OCR on first page
        text = pytesseract.image_to_string(images[0])
        
        # Save raw OCR text to file for manual inspection
        raw_text_path = os.path.join(UPLOAD_FOLDER, f"raw_ocr_{os.path.basename(pdf_path).replace('.pdf', '.txt')}")
        with open(raw_text_path, 'w', encoding='utf-8') as f:
            f.write(text)
        logger.info(f"Raw OCR text saved to: {raw_text_path}")
        
        # Detect all details
        course_code = find_course_code(text)
        exam_type = detect_exam_type(text)
        year = extract_year(text)
        
        return {
            'course_code': course_code,
            'exam_type': exam_type,
            'year': year,
            'raw_ocr_text': text
        }
        
    except Exception as e:
        logger.error(f"Failed to detect document details: {str(e)}")
        raise Exception(f"Failed to detect document details: {str(e)}")

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/detect_details', methods=['POST'])
def detect_details():
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file part'}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"temp_{filename}")
        file.save(filepath)
        
        try:
            details = detect_document_details(filepath)
            
            # Add success flag
            details['success'] = True
            
            return jsonify(details)
        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'success': False, 'error': str(e)}), 500
    
    return jsonify({'success': False, 'error': 'Invalid file type'}), 400

if __name__ == '__main__':
    logger.info(f"Starting Flask application...")
    logger.info(f"Upload folder: {UPLOAD_FOLDER}")
    
    # Check if uploads directory exists and is writable
    logger.info(f"Checking uploads directory: {UPLOAD_FOLDER}")
    if not os.path.exists(UPLOAD_FOLDER):
        try:
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            logger.info(f"Created uploads directory at: {UPLOAD_FOLDER}")
        except Exception as e:
            logger.error(f"ERROR: Could not create uploads directory: {str(e)}")
    else:
        logger.info(f"Uploads directory exists at: {UPLOAD_FOLDER}")
    
    # Test write access to uploads directory
    test_file = os.path.join(UPLOAD_FOLDER, 'test_write.txt')
    try:
        with open(test_file, 'w') as f:
            f.write("Test write permission")
        logger.info(f"Successfully wrote to uploads directory")
        os.remove(test_file)
    except Exception as e:
        logger.error(f"ERROR: Cannot write to uploads directory: {str(e)}")
    
    # Start Flask app
    app.run(debug=True, host='0.0.0.0', port=5001)
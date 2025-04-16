import os
import re
import json
from datetime import datetime
from flask import Flask, request, render_template, flash, redirect, url_for, jsonify
from werkzeug.utils import secure_filename
from pdf2image import convert_from_path
import pytesseract
from PIL import Image
from flask_cors import CORS

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
METADATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'document_metadata.json')
POPPLER_PATH = r'C:\Users\saika\Downloads\Release-24.08.0-0\poppler-24.08.0\Library\bin'
TESSERACT_PATH = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
ALLOWED_EXTENSIONS = {'pdf'}

# Set up Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize directories and files
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
if not os.path.exists(METADATA_FILE):
    with open(METADATA_FILE, 'w') as f:
        json.dump([], f)

# Configure Tesseract
pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

# List of course codes to search for
COURSE_CODES = [
    # Original codes
    "CSI101", "CSI102", "CSC201", "CSC202", "CSC203", "CSC204", "CSC205", "CSC206",
    "CSC207", "CSC208", "CSC209", "CSC210", "CSC211", "CSC301", "CSC302", "CSC303",
    "CSC304", "CSC305", "CSC306", "CSC307", "CSC308", "CSC401", "CSC402", "CSC501",
    "CSC502", "CSC503", "CSC504", "CSC505", "CSC506", "CSC507", "CSC508", "CSC509",
    "CSC510", "CSC516", "CSC517", "CSC518", "CSC597", "CSC598", "CSC599", "CSS401",
    
    # Additional CSE codes
    "CSE201", "CSE202",
    
    # Additional CSD codes
    "CSD401", "CSD402", "CSD403", "CSD404", "CSD405", "CSD406", "CSD407", "CSD408",
    "CSD409", "CSD410", "CSD501", "CSD502", "CSD503", "CSD504", "CSD505", "CSD506",
    "CSD507", "CSD508", "CSD509", "CSD510", "CSD511", "CSD513", "CSD514", "CSD515",
    "CSD516", "CSD517", "CSD518", "CSD519", "CSD520", "CSD521",
    
    # Additional CSO codes
    "CSO302", "CSO303", "CSO304", "CSO403", "CSO404", "CSO501", "CSO502", "CSO503",
    "CSO504", "CSO505", "CSO506", "CSO507", "CSO508", "CSO509", "CSO801"
]

class NoCourseCodeError(Exception):
    """Exception raised when no course code is found in the document"""
    pass

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def detect_exam_type(text):
    """Detect the type of examination from the text"""
    text = text.lower()
    
    if any(term in text for term in ['end sem', 'end semester', 'end-sem', 'endsem']):
        return 'End_Semester'
    elif any(term in text for term in ['mid sem', 'mid semester', 'mid-sem', 'midsem']):
        return 'Mid_Semester'
    elif any(term in text for term in ['quiz', 'quizz']):
        return 'Quiz'
    
    return 'End_Semester'  # Default to End Semester if not found

def detect_semester_type(text):
    """Detect the semester type from the text"""
    text = text.lower()
    
    if any(term in text for term in ['winter sem', 'winter semester']):
        return 'Winter'
    elif any(term in text for term in ['summer sem', 'summer semester']):
        return 'Summer'
    elif any(term in text for term in ['monsoon sem', 'monsoon semester']):
        return 'Monsoon'
    
    return 'Winter'  # Default to Winter if not found

def extract_date(text):
    """Extract date from text using various formats"""
    # Common date patterns in exam papers
    date_patterns = [
        r'Date:?\s*(\d{1,2})[\s-]*([A-Za-z]+)[\s-]*(\d{4})',  # e.g., Date: 12 May 2023
        r'(\d{1,2})[-/](\d{1,2})[-/](\d{4})',  # e.g., 12/05/2023
        r'(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})'  # e.g., 12th May 2023
    ]
    
    for pattern in date_patterns:
        matches = re.findall(pattern, text)
        if matches:
            for match in matches:
                try:
                    if len(match[1]) <= 2:  # If month is in number format
                        date = datetime.strptime(f"{match[0]}/{match[1]}/{match[2]}", "%d/%m/%Y")
                    else:  # If month is in text format
                        date = datetime.strptime(f"{match[0]} {match[1]} {match[2]}", "%d %B %Y")
                    return date
                except ValueError:
                    continue
    return None

def determine_academic_year(date, semester_type):
    """Determine academic year based on date and semester type"""
    if not date:
        return None
        
    year = date.year
    
    if semester_type == 'Monsoon':
        return f"{year}-{str(year+1)[2:]}"
    else:  # Winter or Summer
        return f"{year-1}-{str(year)[2:]}"

def find_course_code(text):
    """Search for course codes in the text, handling possible OCR variations"""
    text = ' '.join(text.split())
    
    # Try direct regex pattern first
    course_code_pattern = r'(?:CS[ODIE]|CSD|CSE)\s*\d{3}'
    potential_direct_codes = re.findall(course_code_pattern, text)
    if potential_direct_codes:
        cleaned_codes = [''.join(code.split()) for code in potential_direct_codes]
        
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
                
                if std_code in COURSE_CODES:
                    return std_code
    
    # Create variations to handle OCR errors
    for code in COURSE_CODES:
        dept_code = code[:3]
        number_part = code[3:]
        
        # Common misrecognitions of CSC/CSI/etc.
        dept_variations = [
            dept_code,
            dept_code.replace('S', '5'),
            dept_code.replace('S', '$'),
            dept_code.replace('O', '0'),
            dept_code.replace('I', '1'),
            dept_code.replace('C', 'G')
        ]
        
        # Common misrecognitions of numbers
        number_variations = [
            number_part,
            number_part.replace('0', 'O'),
            number_part.replace('1', 'I'),
            number_part.replace('1', 'l')
        ]
        
        # Check all variations
        for dept_var in dept_variations:
            for num_var in number_variations:
                pattern = dept_var + num_var
                if pattern in text:
                    return code
    
    # If no match found, look for partial matches
    potential_codes = re.findall(r'[A-Z]{2,3}\s*\d{3}', text)
    if potential_codes and len(potential_codes) > 0:
        return ''.join(potential_codes[0].split())
    
    return None

def detect_document_details(pdf_path):
    """Detect all document details from the PDF"""
    try:
        # Convert first page of PDF to image
        images = convert_from_path(pdf_path, poppler_path=POPPLER_PATH, first_page=1, last_page=1)
        
        if not images:
            raise Exception("Failed to convert PDF to image")
            
        # Perform OCR on first page
        text = pytesseract.image_to_string(images[0])
        
        # Save raw OCR text to file
        raw_text_path = os.path.join(app.config['UPLOAD_FOLDER'], f"raw_ocr_{os.path.basename(pdf_path).replace('.pdf', '.txt')}")
        with open(raw_text_path, 'w', encoding='utf-8') as f:
            f.write(text)
        
        # Detect all details
        course_code = find_course_code(text)
        exam_type = detect_exam_type(text)
        semester_type = detect_semester_type(text)
        exam_date = extract_date(text)
        acad_year = determine_academic_year(exam_date, semester_type) if exam_date else None
        
        return {
            'course_code': course_code,
            'exam_type': exam_type,
            'semester_type': semester_type,
            'acad_year': acad_year,
            'raw_ocr_file': raw_text_path,
            'raw_ocr_text': text
        }
        
    except Exception as e:
        raise Exception(f"Failed to detect document details: {str(e)}")

def save_document_metadata(details, pdf_filename, ocr_filename):
    """Save document metadata to JSON file"""
    try:
        # Read existing metadata
        with open(METADATA_FILE, 'r') as f:
            try:
                metadata = json.load(f)
                if not isinstance(metadata, list):
                    metadata = []
            except json.JSONDecodeError:
                metadata = []
        
        # Create new document entry
        document_info = {
            'course_code': details['course_code'],
            'exam_type': details['exam_type'],
            'semester_type': details['semester_type'],
            'academic_year': details['acad_year'],
            'pdf_file': pdf_filename,
            'ocr_file': ocr_filename,
            'processed_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Add new entry to metadata
        metadata.append(document_info)
        
        # Save updated metadata
        with open(METADATA_FILE, 'w') as f:
            json.dump(metadata, f, indent=4)
            
    except Exception as e:
        print(f"Error saving metadata: {str(e)}")

def process_confirmed_pdf(pdf_path, details):
    """Process PDF with confirmed details"""
    try:
        # Convert PDF to images
        images = convert_from_path(pdf_path, poppler_path=POPPLER_PATH)
        
        # Create filename with confirmed details
        base_name = f"{details['course_code']}_{details['exam_type']}_{details['semester_type']}_{details['acad_year']}"
        new_pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{base_name}.pdf")
        new_text_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{base_name}_ocr.txt")
        
        # Process images and save OCR text
        with open(new_text_path, 'w', encoding='utf-8') as text_file:
            for i, image in enumerate(images):
                text = pytesseract.image_to_string(image)
                text_file.write(f"=== Page {i+1} ===\n")
                text_file.write(text)
                text_file.write("\n\n")
        
        # Rename the PDF file
        import shutil
        shutil.copy2(pdf_path, new_pdf_path)
        os.remove(pdf_path)
        
        # Save metadata to JSON file
        save_document_metadata(
            details,
            os.path.basename(new_pdf_path),
            os.path.basename(new_text_path)
        )
        
        return new_text_path
        
    except Exception as e:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        raise Exception(f"PDF processing failed: {str(e)}")

# API Routes
@app.route('/detect_details', methods=['POST'])
def detect_details():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"temp_{filename}")
        file.save(filepath)
        
        try:
            details = detect_document_details(filepath)
            return jsonify({
                'success': True,
                'course_code': details['course_code'],
                'exam_type': details['exam_type'],
                'semester_type': details['semester_type'],
                'year': details['acad_year'],
                'raw_ocr_text': details['raw_ocr_text']
            })
        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'success': False, 'error': str(e)}), 500
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/process_file', methods=['POST'])
def process_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Get confirmed details
        details = {
            'course_code': request.form.get('confirmed_course_code'),
            'exam_type': request.form.get('confirmed_exam_type'),
            'semester_type': request.form.get('confirmed_semester'),
            'acad_year': request.form.get('confirmed_acad_year')
        }
        
        # Validate details
        if not all(details.values()):
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'error': 'Missing required details'}), 400
            
        try:
            output_path = process_confirmed_pdf(filepath, details)
            return jsonify({
                'message': 'File processed successfully',
                'output_path': output_path
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/')
def upload_file():
    return render_template('upload.html')

@app.route('/save_ocr_text', methods=['POST'])
def save_ocr_text():
    """Route to save raw OCR text separately"""
    try:
        data = request.get_json()
        if not data or 'text' not in data or 'filename' not in data:
            return jsonify({'error': 'Missing text or filename parameter'}), 400
            
        ocr_text = data['text']
        filename = secure_filename(data['filename'])
        
        # Save the OCR text to a dedicated file
        ocr_path = os.path.join(app.config['UPLOAD_FOLDER'], f"manual_ocr_{filename}.txt")
        
        with open(ocr_path, 'w', encoding='utf-8') as f:
            f.write(ocr_text)
            
        return jsonify({
            'message': 'OCR text saved successfully',
            'ocr_path': ocr_path
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print(f"Starting Flask application on port 5001...")
    print(f"Upload folder: {UPLOAD_FOLDER}")
    print(f"Metadata file: {METADATA_FILE}")
    app.run(debug=True, port=5001) 
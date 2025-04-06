const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromPDF = async (filePath) => {
  try {
    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);
    
    // Parse the PDF
    const data = await pdfParse(dataBuffer);
    
    // Return the text content
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Extract metadata from PDF content using regex patterns
 * @param {string} text - PDF text content
 * @returns {Object} - Extracted metadata
 */
const extractMetadata = (text) => {
  // Initialize metadata object
  const metadata = {
    subject: '',
    course: '',
    examType: 'other',
    year: new Date().getFullYear()
  };
  
  // Check for subject pattern (e.g., "Subject: Computer Science")
  const subjectMatch = text.match(/subject\s*[:|-]\s*([^\n,]+)/i);
  if (subjectMatch && subjectMatch[1]) {
    metadata.subject = subjectMatch[1].trim();
  }
  
  // Check for course pattern (e.g., "Course: CS101" or "Course Code: CS101")
  const courseMatch = text.match(/course(?:\s*code)?\s*[:|-]\s*([^\n,]+)/i);
  if (courseMatch && courseMatch[1]) {
    metadata.course = courseMatch[1].trim();
  }
  
  // Check for exam type
  const examTypePatterns = [
    { pattern: /mid\s*[-]?\s*(?:sem|semester|term)/i, type: 'mid-semester' },
    { pattern: /end\s*[-]?\s*(?:sem|semester|term)/i, type: 'end-semester' },
    { pattern: /final\s*(?:exam|examination)/i, type: 'end-semester' },
    { pattern: /quiz/i, type: 'quiz' }
  ];
  
  for (const { pattern, type } of examTypePatterns) {
    if (pattern.test(text)) {
      metadata.examType = type;
      break;
    }
  }
  
  // Check for year (4-digit number between 1950 and current year + 5)
  const currentYear = new Date().getFullYear();
  const yearPattern = new RegExp(`(19[5-9][0-9]|20[0-9][0-9])`, 'g');
  const yearMatches = text.match(yearPattern);
  
  if (yearMatches) {
    // Filter out years that are too far in the future
    const validYears = yearMatches
      .map(y => parseInt(y, 10))
      .filter(y => y >= 1950 && y <= currentYear + 5);
      
    if (validYears.length > 0) {
      // Use the most recent year that isn't in the future
      const futureYears = validYears.filter(y => y > currentYear);
      const pastOrPresentYears = validYears.filter(y => y <= currentYear);
      
      if (pastOrPresentYears.length > 0) {
        metadata.year = Math.max(...pastOrPresentYears);
      } else if (futureYears.length > 0) {
        metadata.year = Math.min(...futureYears);
      }
    }
  }

  return metadata;
};

/**
 * Extract metadata using an AI model through OpenAI API
 * @param {string} text - PDF text content
 * @returns {Promise<Object>} - Extracted metadata
 */
async function extractMetadataWithAI(text) {
  try {
    // Only proceed if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log('OpenAI API key not found, falling back to regex extraction');
      return extractMetadata(text);
    }

    // Prepare the text - limit length to avoid large API requests
    const limitedText = text.substring(0, 4000);
    
    // Call OpenAI API
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system", 
          content: "Extract metadata from the question paper text. Return ONLY a JSON object with these fields: subject (the academic subject), course (course code or name), examType (must be one of: mid-semester, end-semester, quiz, other), year (4-digit number between 1950 and current year)."
        },
        {
          role: "user",
          content: `Extract metadata from this question paper: ${limitedText}`
        }
      ],
      temperature: 0.3
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('AI response received');
    
    // Parse the AI response
    const aiResponse = response.data.choices[0].message.content;
    try {
      // Extract JSON from the response (in case AI adds explanatory text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      
      const metadata = JSON.parse(jsonString);
      
      // Validate and format the extracted metadata
      return {
        subject: metadata.subject || '',
        course: metadata.course || '',
        examType: ['mid-semester', 'end-semester', 'quiz', 'other'].includes(metadata.examType) 
          ? metadata.examType 
          : 'other',
        year: parseInt(metadata.year) || new Date().getFullYear()
      };
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fall back to regex extraction if AI parsing fails
      return extractMetadata(text);
    }
  } catch (error) {
    console.error('Error calling AI service:', error.message);
    // Fall back to regex extraction if AI call fails
    return extractMetadata(text);
  }
}

/**
 * Process PDF file and extract metadata
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<Object>} - Extracted metadata
 */
const processPDF = async (filePath) => {
  try {
    const text = await extractTextFromPDF(filePath);
    
    // Try AI extraction first
    let metadata;
    try {
      console.log('Attempting AI metadata extraction...');
      metadata = await extractMetadataWithAI(text);
      console.log('AI metadata extraction result:', metadata);
    } catch (aiError) {
      console.error('AI metadata extraction failed:', aiError);
      console.log('Falling back to regex-based extraction');
      metadata = extractMetadata(text);
    }
    
    // If subject or course is empty, try to extract from filename
    const filename = path.basename(filePath, path.extname(filePath));
    
    if (!metadata.subject) {
      // Try to get subject from filename
      const filenameWords = filename.split(/[_\s-]+/);
      if (filenameWords.length > 0) {
        metadata.subject = filenameWords[0];
      }
    }
    
    return metadata;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('Failed to process PDF');
  }
};

module.exports = {
  extractTextFromPDF,
  extractMetadata,
  extractMetadataWithAI,
  processPDF
}; 
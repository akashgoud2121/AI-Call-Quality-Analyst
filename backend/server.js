const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

app.post('/api/analyze-call', upload.single('audioFile'), async (req, res) => {
  try {
    let textToAnalyze = '';

    if (req.body.transcript) {
      textToAnalyze = req.body.transcript;
      console.log('Using provided transcript');
    } else if (req.file) {
      // For demo, using a sample conversation
      textToAnalyze = `
        Agent: Hello, this is regarding the web development course.
        Customer: Yes, I'm interested in learning web development.
        Agent: Great! Let me tell you about our comprehensive program.
        Customer: What's the duration and fee structure?
        Agent: The course is 3 months long, and the fee is ₹25,000.
      `;
      console.log('Using sample conversation for analysis');
    }

    // Generate analysis using Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    
    const prompt = `
    Analyze this sales call transcript and provide detailed scores and feedback:
    
    Transcript:
    ${textToAnalyze}
    
    Please analyze and provide:
    1. Engagement score (out of 20) and specific examples of rapport building
    2. Clarity score (out of 20) and examples of clear communication
    3. Product Knowledge score (out of 20) and examples of expertise demonstrated
    4. Listening Skills score (out of 20) and examples of active listening
    5. Handling Objections score (out of 20) and how concerns were addressed
    6. Closing Techniques score (out of 20) and effectiveness of call closure
    7. Specific recommendations for improvement
    
    Format the response in a structured way that can be parsed programmatically.
    `;

    console.log('Sending request to Gemini AI...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();
    console.log('Received response from Gemini AI');

    // Parse the AI response
    const scores = {
      engagement: extractScore(analysisText, 'Engagement'),
      clarity: extractScore(analysisText, 'Clarity'),
      productKnowledge: extractScore(analysisText, 'Product Knowledge'),
      listeningSkills: extractScore(analysisText, 'Listening Skills'),
      handlingObjections: extractScore(analysisText, 'Handling Objections'),
      closingTechniques: extractScore(analysisText, 'Closing Techniques')
    };

    // Calculate total score
    const totalScore = Math.round(
      Object.values(scores).reduce((sum, item) => sum + item.score, 0) * (100 / 120)
    );

    const analysis = {
      totalScore,
      ...scores,
      recommendations: extractRecommendations(analysisText)
    };

    console.log('Analysis completed successfully');
    res.json(analysis);

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis error', 
      details: error.message 
    });
  } finally {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
});

// Helper functions to parse Gemini AI response
function extractScore(text, category) {
  const regex = new RegExp(`${category}[^:]*: (\\d+)[^\\n]*\\n([^\\n]*)`);
  const match = text.match(regex);
  return {
    score: match ? parseInt(match[1]) : 0,
    comments: match ? match[2].trim() : `No specific feedback for ${category}`
  };
}

function extractRecommendations(text) {
  const match = text.match(/recommendations?:?([^\n]*(?:\n[^\n]*)*$)/i);
  return match ? match[1].trim() : "No specific recommendations provided";
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
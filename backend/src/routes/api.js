import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import CallQualityAnalyzer from './components/CallQualityAnalyzer';
import { CssBaseline } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CallQualityAnalyzer />
    </ThemeProvider>
  );
}

export default App;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/analyze-call', upload.single('audioFile'), async (req, res) => {
  try {
    // Mock analysis for demonstration
    const analysis = {
      score: Math.floor(Math.random() * 3) + 8,
      analysis: `Call Analysis Summary:
      
1. Overall Quality Score: ${Math.floor(Math.random() * 3) + 8}/10

2. Strengths:
- Clear communication
- Professional tone
- Effective problem resolution
- Good listening skills

3. Areas for Improvement:
- Could reduce hold time
- More proactive solutions
- Additional product knowledge recommended

4. Customer Satisfaction Indicators:
- Positive tone throughout
- Issue resolved successfully
- Customer expressed appreciation

5. Recommendations:
- Consider additional training on new products
- Implement faster authentication process
- Use more positive language
`
    };

    res.json(analysis);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

module.exports = router;
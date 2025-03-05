import { Request, Response } from 'express';
import { analyzeAudio } from '../services/aiService';

export const analyzeCall = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const analysisResult = await analyzeAudio(req.file);
    return res.status(200).json(analysisResult);
  } catch (error) {
    console.error('Error analyzing audio:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
import React, { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  LinearProgress,
  Card,
  CardContent,
  Alert,
  IconButton,
  Grid,
  Rating,
  Divider,
  Fade, 
  Zoom, 
  CircularProgress, 
  Stack,
  Chip,
  Avatar,
  Tooltip
} from '@mui/material';
import { 
  CloudUpload, 
  Assessment, 
  Mic, 
  Stop,
  SupportAgent, 
  Psychology, 
  Timeline, 
  Speed,
  EmojiObjects,
  Grade
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Update the theme configuration
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#ff4081',
      light: '#ff79b0',
      dark: '#c60055',
    },
    background: {
      default: '#000000',
      paper: 'rgba(255, 255, 255, 0.05)',
    },
  },
});

const Input = styled('input')({
  display: 'none',
});

const VisuallyStyledBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ff7c7c 0%, #000DFF 100%)',
  borderRadius: '20px',
  padding: theme.spacing(6),
  color: 'white',
  marginBottom: theme.spacing(4),
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const ScoreCard = ({ title, score, comments, icon: Icon }) => (
  <Zoom in={true}>
    <Card 
      sx={{ 
        mb: 2,
        background: 'linear-gradient(145deg, #ffffff 0%, #f4f4f4 100%)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.25)',
        }
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <Icon />
          </Avatar>
          <Typography variant="h6">{title}</Typography>
          <Chip
            label={`${score}/20`}
            color={score >= 15 ? 'success' : score >= 10 ? 'warning' : 'error'}
            sx={{ ml: 'auto' }}
          />
        </Stack>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {comments}
        </Typography>
      </CardContent>
    </Card>
  </Zoom>
);

const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognition = useRef(null);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    recognition.current = new SpeechRecognition();
    recognition.current.continuous = true;
    recognition.current.interimResults = true;
    recognition.current.lang = 'hi-IN';

    recognition.current.onresult = (event) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(prev => prev + transcriptText + ' ');
    };

    recognition.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognition.current) {
      recognition.current.stop();
    }
    setIsRecording(false);
  };

  return { transcript, isRecording, startRecording, stopRecording };
};

// Add this styled component for the main container
const MainContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(4),
  backgroundColor: '#000000',
  '& .MuiPaper-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
  }
}));

function CallQualityAnalyzer() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const { transcript, isRecording, startRecording, stopRecording } = useSpeechRecognition();

  const handleFileUpload = useCallback((event) => {
    const uploadedFile = event.target.files[0];
    
    if (!uploadedFile) {
      setError('Please select a file');
      return;
    }
  
    // Check file type
    if (!uploadedFile.type.startsWith('audio/')) {
      setError('Please upload an audio file');
      return;
    }
  
    setFile(uploadedFile);
    setError(null);
  }, []);

  const submitAnalysis = useCallback(async () => {
    if (!file && !transcript) {
      setError('Please either upload an audio file or record audio');
      return;
    }
  
    setUploading(true);
    setError(null);
    const formData = new FormData();
    
    if (file) {
      formData.append('audioFile', file);
    }
    if (transcript) {
      formData.append('transcript', transcript);
    }
  
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      console.log('Sending request to:', backendUrl);
  
      const response = await axios.post(
        `${backendUrl}/api/analyze-call`,
        formData,
        {
          headers: { 
            'Content-Type': 'multipart/form-data'
          },
          timeout: 120000
        }
      );
      
      if (response.data) {
        console.log('Analysis response:', response.data);
        setAnalysis(response.data);
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Error details:', error);
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please ensure the backend is running.');
      } else if (error.response?.data?.error) {
        setError(`Server error: ${error.response.data.error}`);
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }
  }, [file, transcript]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        backgroundColor: 'black',
        minHeight: '100vh',
        pt: 4,
        pb: 4
      }}>
        <MainContainer maxWidth="md">
          <Fade in={true}>
            <VisuallyStyledBox>
              <Typography 
                variant="h3" 
                gutterBottom 
                align="center"
                sx={{
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                  letterSpacing: '0.05em'
                }}
              >
                AI Call Quality Analyst
              </Typography>
              <Typography 
                variant="h6" 
                align="center"
                sx={{ opacity: 0.9 }}
              >
                Upload your call recording for instant AI-powered analysis
              </Typography>
            </VisuallyStyledBox>
          </Fade>

          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              mt: 4,
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <label htmlFor="contained-button-file">
                <Input
                  accept="audio/*"
                  id="contained-button-file"
                  type="file"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUpload />}
                  sx={{ 
                    mb: 2,
                    borderRadius: '12px',
                    padding: '12px 24px',
                    background: 'linear-gradient(45deg, #ff7c7c 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 10px 4px rgba(33, 203, 243, .3)',
                    }
                  }}
                >
                  Upload Audio File
                </Button>
              </label>
              {file && (
                <Typography variant="body2" color="textSecondary">
                  Selected file: {file.name}
                </Typography>
              )}
            </Box>

            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Button
                variant="contained"
                color={isRecording ? "error" : "primary"}
                onClick={isRecording ? stopRecording : startRecording}
                startIcon={isRecording ? <Stop /> : <Mic />}
                sx={{ mr: 2 }}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
              
              {transcript && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  Transcript: {transcript}
                </Typography>
              )}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={submitAnalysis}
              disabled={(!file && !transcript) || uploading}
              startIcon={<Assessment />}
              sx={{ mb: 2 }}
            >
              Analyze Call
            </Button>

            {uploading && <LinearProgress sx={{ mb: 2 }} />}

            {analysis && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom align="center">
                    Call Quality Analysis Report
                  </Typography>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h4" align="center" color="primary" gutterBottom>
                      Total Score: {analysis.totalScore}/100
                    </Typography>
                    
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        mb: 4 
                      }}
                    >
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress
                          variant="determinate"
                          value={analysis.totalScore}
                          size={120}
                          thickness={4}
                          sx={{
                            color: theme.palette.primary.main,
                            backgroundColor: theme.palette.grey[200],
                            borderRadius: '50%',
                            boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography
                            variant="h4"
                            component="div"
                            color="primary"
                          >
                            {analysis.totalScore}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={12}>
                        <ScoreCard 
                          title="Engagement"
                          score={analysis.engagement.score}
                          comments={analysis.engagement.comments}
                          icon={Psychology}
                        />
                        <ScoreCard 
                          title="Clarity"
                          score={analysis.clarity.score}
                          comments={analysis.clarity.comments}
                          icon={SupportAgent}
                        />
                        <ScoreCard 
                          title="Product Knowledge"
                          score={analysis.productKnowledge.score}
                          comments={analysis.productKnowledge.comments}
                          icon={EmojiObjects}
                        />
                        <ScoreCard 
                          title="Listening Skills"
                          score={analysis.listeningSkills.score}
                          comments={analysis.listeningSkills.comments}
                          icon={Grade}
                        />
                        <ScoreCard 
                          title="Handling Objections"
                          score={analysis.handlingObjections.score}
                          comments={analysis.handlingObjections.comments}
                          icon={Timeline}
                        />
                        <ScoreCard 
                          title="Closing Techniques"
                          score={analysis.closingTechniques.score}
                          comments={analysis.closingTechniques.comments}
                          icon={Speed}
                        />
                      </Grid>
                    </Grid>

                    {analysis.recommendations && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Recommendations for Improvement
                        </Typography>
                        <Paper sx={{ p: 2, backgroundColor: '#e3f2fd' }}>
                          <Typography variant="body2">
                            {analysis.recommendations}
                          </Typography>
                        </Paper>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Paper>
        </MainContainer>
      </Box>
    </ThemeProvider>
  );
}

export default CallQualityAnalyzer;
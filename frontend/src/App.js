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
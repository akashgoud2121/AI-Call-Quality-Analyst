import React from 'react';
import { Box, Typography } from '@mui/material';

const AnalysisReport = ({ analysis }) => {
  if (!analysis) {
    return null;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6">Analysis Report</Typography>
      <pre>{JSON.stringify(analysis, null, 2)}</pre>
    </Box>
  );
};

export default AnalysisReport;
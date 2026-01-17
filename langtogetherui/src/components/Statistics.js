import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const fetchStatistics = async (progressDeckId) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${process.env.REACT_APP_API_URL}api/ProgressDecks/${progressDeckId}/statistics`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch statistics');
  return await response.json();
};

function Statistics() {
  const { progressDeckId } = useParams();
  const [statistics, setStatistics] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const data = await fetchStatistics(progressDeckId);
        setStatistics(data);
      } catch (error) {
        console.error('Failed to load statistics:', error);
        setError('Failed to load statistics.');
      }
    };
    loadStatistics();
  }, [progressDeckId]);

  const preprocessData = (stats) => {
    console.log(stats);
    stats = stats.$values;
    if (!stats || stats.length === 0) return { labels: [], datasets: [] };

    const labels = stats.map(entry => entry.date || 'Unknown Date');
    const newWords = stats.map(entry => entry.newWordsLearned || 0);
    const reviewedWords = stats.map(entry => entry.wordsReviewed || 0);

    return {
      labels,
      datasets: [
        {
          label: 'New Words Learned',
          data: newWords,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
        {
          label: 'Words Reviewed',
          data: reviewedWords,
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
        },
      ],
    };
  };

  const chartData = preprocessData(statistics);

  if (error) return <Typography>{error}</Typography>;

  return (
    <Container>
      <Button onClick={() => navigate(-1)} variant="outlined" color="primary" sx={{ marginBottom: 2 }}>
        Back
      </Button>
      <Typography variant="h4" gutterBottom>Progress Deck Statistics</Typography>
      <Box sx={{ height: '400px', marginTop: 4 }}>
        <Bar data={chartData} />
      </Box>
    </Container>
  );
}

export default Statistics;

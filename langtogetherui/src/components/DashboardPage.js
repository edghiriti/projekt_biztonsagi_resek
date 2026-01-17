import React, { useEffect, useState } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import Layout from './Layout';

const fetchCombinedStatistics = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${process.env.REACT_APP_API_URL}api/ProgressDecks/combined-statistics`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch combined statistics');
  return await response.json();
};

function DashboardPage() {
  const [statistics, setStatistics] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCombinedStatistics = async () => {
      try {
        const data = await fetchCombinedStatistics();
        setStatistics(data);
      } catch (error) {
        console.error('Failed to load combined statistics:', error);
        setError('Failed to load combined statistics.');
      }
    };
    loadCombinedStatistics();
  }, []);

  const preprocessData = (stats) => {
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
    <Layout>
      <Container>
        <Typography variant="h4" gutterBottom>Combined Progress Deck Statistics</Typography>
        <Box sx={{ height: '400px', marginTop: 4 }}>
          <Bar data={chartData} />
        </Box>
      </Container>
    </Layout>
  );
}

export default DashboardPage;

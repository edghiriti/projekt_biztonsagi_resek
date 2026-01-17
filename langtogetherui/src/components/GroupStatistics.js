import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Container, Grid, Paper, IconButton
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import 'chart.js/auto';

const getWeekRange = (date) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
};

const fetchGroupStatistics = async (groupId, startDate, endDate) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${process.env.REACT_APP_API_URL}api/Groups/${groupId}/statistics?start=${startDate.toISOString()}&end=${endDate.toISOString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch group statistics');
  return await response.json();
};

function GroupStatistics() {
  const { groupId } = useParams();
  const [statistics, setStatistics] = useState([]);
  const [error, setError] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const { start, end } = getWeekRange(selectedWeek);
        const data = await fetchGroupStatistics(groupId, start, end);
        setStatistics(data.$values || []);

        const users = Array.from(new Set(data.$values.map(item => item.userName)));
        setUniqueUsers(users);
      } catch (error) {
        console.error('Failed to load group statistics:', error);
        setError('Failed to load group statistics.');
      }
    };
    loadStatistics();
  }, [groupId, selectedWeek]);

  const handlePreviousWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedWeek(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedWeek(newDate);
  };

  const preprocessData = (stats, userName, dataKey, color) => {
    const { start, end } = getWeekRange(selectedWeek);
    const userStats = stats.filter(stat => stat.userName === userName);
    const datesInRange = [];
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      datesInRange.push(new Date(date).toLocaleDateString());
    }

    const labels = datesInRange;
    const data = datesInRange.map(date => {
      const stat = userStats.find(stat => new Date(stat.date).toLocaleDateString() === date);
      return stat ? stat[dataKey] : 0;
    });

    return {
      labels,
      datasets: [
        {
          label: userName,
          data,
          backgroundColor: color,
        },
      ],
    };
  };

  if (error) return <Typography>{error}</Typography>;

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <Button onClick={() => navigate(-1)} variant="outlined" color="primary">
          Back
        </Button>
        <Typography variant="h4" align="center" sx={{ flexGrow: 1 }}>Group Progress Statistics</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 2 }}>
        <IconButton onClick={handlePreviousWeek}>
          <ArrowBackIosIcon />
        </IconButton>
        <Typography variant="h6">
          {`${getWeekRange(selectedWeek).start.toLocaleDateString()} - ${getWeekRange(selectedWeek).end.toLocaleDateString()}`}
        </Typography>
        <IconButton onClick={handleNextWeek}>
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>
      <Grid container spacing={3}>
        {uniqueUsers.map(user => (
          <Grid item xs={12} key={user}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="h5" gutterBottom>{`Statistics for ${user}`}</Typography>
              <Typography variant="h6" gutterBottom>New Words Learned</Typography>
              <Box sx={{ height: '300px' }}>
                <Bar
                  data={preprocessData(statistics, user, 'newWordsLearned', 'rgba(0, 0, 128, 0.6)')}
                  options={{
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      x: {
                        type: 'category',
                        title: {
                          display: true,
                          text: 'Date',
                        },
                      },
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'New Words Learned',
                        },
                      },
                    },
                  }}
                />
              </Box>
              <Typography variant="h6" gutterBottom>Words Reviewed</Typography>
              <Box sx={{ height: '300px' }}>
                <Bar
                  data={preprocessData(statistics, user, 'wordsReviewed', 'rgba(124, 252, 0, 0.6)')}
                  options={{
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      x: {
                        type: 'category',
                        title: {
                          display: true,
                          text: 'Date',
                        },
                      },
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Words Reviewed',
                        },
                      },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default GroupStatistics;

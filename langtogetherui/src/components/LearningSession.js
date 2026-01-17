import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper, Grid } from '@mui/material';
import { styled } from '@mui/system';

const Container = styled(Box)({
  backgroundColor: '#b3e5fc',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  padding: '20px',
});

const CardContainer = styled(Paper)({
  maxWidth: '600px',
  width: '100%',
  padding: '20px',
  textAlign: 'center',
});

const fetchFilteredProgressDeck = async (progressDeckId) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${process.env.REACT_APP_API_URL}api/ProgressDecks/${progressDeckId}/filtered`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch progress deck');
  return await response.json();
};

const fetchCardCounts = async (progressDeckId) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${process.env.REACT_APP_API_URL}api/ProgressDecks/${progressDeckId}/counts`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch card counts');
  return await response.json();
};

const updateProgressCard = async (progressCardId, quality) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${process.env.REACT_APP_API_URL}api/ProgressDecks/UpdateProgressCard`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ progressCardId, quality }),
  });
  if (!response.ok) throw new Error('Failed to update progress card');
  return await response.json();
};

function LearningSession() {
  const { progressDeckId } = useParams();
  const [progressCard, setProgressCard] = useState(null);
  const [showBack, setShowBack] = useState(false);
  const [stats, setStats] = useState({ newCards: 0, learningCards: 0, reviewCards: 0 });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadNextCard = useCallback(async () => {
    try {
      const data = await fetchFilteredProgressDeck(progressDeckId);
      const nextCard = data.progressCards?.$values?.[0] || null;

      setProgressCard(nextCard);
      const counts = await fetchCardCounts(progressDeckId);
      setStats(counts);
    } catch (error) {
      console.error('Failed to load progress deck or stats:', error);
      setError('Failed to load progress deck or statistics.');
    }
  }, [progressDeckId]);

  useEffect(() => {
    loadNextCard();
  }, [loadNextCard]);

  if (error) return <Typography>{error}</Typography>;
  if (!progressCard) {
    return (
      <Container>
        <CardContainer>
          <Typography>No more cards available for today.</Typography>
          <Button onClick={() => navigate(-1)} variant="outlined" color="primary" sx={{ marginTop: 3 }}>
            Back
          </Button>
        </CardContainer>
      </Container>
    );
  }

  const handleNextCard = () => {
    setShowBack(false);
    loadNextCard();
  };

  const handleQualitySelection = async (quality) => {
    try {
      await updateProgressCard(progressCard.progressCardId, quality);

      handleNextCard();
    } catch (error) {
      console.error('Failed to update progress card:', error);
      setError('Failed to update progress card.');
    }
  };

  return (
    <Container>
      <CardContainer>
        <Button onClick={() => navigate(-1)} variant="outlined" color="primary" sx={{ marginBottom: 2 }}>Back</Button>
        <Typography variant="h4" gutterBottom>Learning Session</Typography>

        <Box sx={{ marginTop: 3 }}>
          {/* --- ITT A MÓDOSÍTÁS (A HIBA) --- */}
        {/* A biztonságos {progressCard.front} helyett dangerouslySetInnerHTML-t használunk */}
        <Typography 
            variant="h5" 
            dangerouslySetInnerHTML={{ __html: progressCard.front }} 
        />

        {showBack && (
           /* Ugyanez a hátoldalra is, ha ott is támadni akarsz */
          <Typography 
            variant="h6" 
            sx={{ marginTop: 2, color: 'gray' }}
            dangerouslySetInnerHTML={{ __html: progressCard.back }}
          />
        )}
        {/* ------------------------------- */}
        </Box>

        {!showBack ? (
          <Button variant="contained" color="primary" onClick={() => setShowBack(true)} sx={{ marginTop: 3 }}>
            Show Answer
          </Button>
        ) : (
          <Grid container spacing={2} sx={{ marginTop: 3 }}>
            <Grid item xs={3}>
              <Button variant="contained" color="error" onClick={() => handleQualitySelection(0)}>Bad</Button>
            </Grid>
            <Grid item xs={3}>
              <Button variant="contained" color="warning" onClick={() => handleQualitySelection(1)}>Hard</Button>
            </Grid>
            <Grid item xs={3}>
              <Button variant="contained" color="success" onClick={() => handleQualitySelection(2)}>Good</Button>
            </Grid>
            <Grid item xs={3}>
              <Button variant="contained" color="primary" onClick={() => handleQualitySelection(3)}>Easy</Button>
            </Grid>
          </Grid>
        )}

        <Box sx={{ marginTop: 3 }}>
          <Typography variant="h6" gutterBottom>Statistics</Typography>
          <Typography variant="body1">New Cards: {stats.newCards}</Typography>
          <Typography variant="body1">Learning Cards: {stats.learningCards}</Typography>
          <Typography variant="body1">Review Cards: {stats.reviewCards}</Typography>
        </Box>
      </CardContainer>
    </Container>
  );
}

export default LearningSession;

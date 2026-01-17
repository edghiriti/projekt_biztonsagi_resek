import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const getAuthToken = () => localStorage.getItem('authToken');

function StartDeckLearningDialog({ open, onClose, deck, onStartLearning }) {
  const [progressDeckName, setProgressDeckName] = useState('');
  const [progressDeckDescription, setProgressDeckDescription] = useState('');
  const [dailyCardLimit, setDailyCardLimit] = useState(20);

  useEffect(() => {
    if (deck) {
      setProgressDeckName(deck.deckName || '');
      setProgressDeckDescription(deck.deckDescription || '');
    }
  }, [deck]);

  const handleStart = async () => {
    const token = getAuthToken();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}api/ProgressDecks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          deckId: deck.deckId,
          name: progressDeckName,
          description: progressDeckDescription,
          dailyCardLimit: dailyCardLimit
        }),
      });

      if (!response.ok) throw new Error('Failed to create progress deck');

      const progressDeck = await response.json();
      onClose();
      onStartLearning(progressDeck.progressDeckId);
    } catch (error) {
      console.error('Failed to create progress deck:', error);
    }
  };

  if (!deck) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {deck.deckName}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Progress Deck Name"
          value={progressDeckName}
          onChange={(e) => setProgressDeckName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Progress Deck Description"
          value={progressDeckDescription}
          onChange={(e) => setProgressDeckDescription(e.target.value)}
          fullWidth
          multiline
          rows={4}
          margin="normal"
        />
        <TextField
          label="Daily Card Limit"
          type="number"
          value={dailyCardLimit}
          onChange={(e) => setDailyCardLimit(parseInt(e.target.value, 10))}
          fullWidth
          margin="normal"
        />
        <Typography variant="h6" gutterBottom>
          Number of Cards
        </Typography>
        <Typography variant="body1" gutterBottom>
          {deck.cards.$values.length}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleStart}>Start</Button>
      </DialogActions>
    </Dialog>
  );
}

export default StartDeckLearningDialog;

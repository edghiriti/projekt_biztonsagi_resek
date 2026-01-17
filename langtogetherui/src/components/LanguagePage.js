import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Switch,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import DeckCreationWizard from './DeckCreationWizard';
import DeckEditWizard from './DeckEditWizard';
import StartDeckLearningDialog from './StartDeckLearningDialog';

const getAuthToken = () => localStorage.getItem('authToken');

const fetchMyDecks = async () => {
  const token = getAuthToken();
  const response = await fetch(`${process.env.REACT_APP_API_URL}api/Decks/MyDecks`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch my decks');
  return await response.json();
};

const fetchPublishedDecks = async () => {
  const token = getAuthToken();
  const response = await fetch(`${process.env.REACT_APP_API_URL}api/Decks/PublishedDecks`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch published decks');
  return await response.json();
};

const fetchDeckWithCards = async (deckId) => {
  const token = getAuthToken();
  const response = await fetch(`${process.env.REACT_APP_API_URL}api/Decks/${deckId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch deck with cards');
  return await response.json();
};

const updatePublishStatus = async (deckId, isPublished) => {
  const token = getAuthToken();
  const response = await fetch(`${process.env.REACT_APP_API_URL}api/Decks/Publish?deckId=${deckId}&isPublished=${isPublished}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to update publish status');
};

function LanguagePage() {
  const [myDecks, setMyDecks] = useState([]);
  const [publishedDecks, setPublishedDecks] = useState([]);
  const [openWizard, setOpenWizard] = useState(false);
  const [openEditWizard, setOpenEditWizard] = useState(false);
  const [deckToEdit, setDeckToEdit] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState(null);
  const [learningDialogOpen, setLearningDialogOpen] = useState(false);
  const [deckToLearn, setDeckToLearn] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    refreshDecks();
  }, []);

  const refreshDecks = async () => {
    try {
      const myDecksData = await fetchMyDecks();
      setMyDecks(myDecksData.$values || []);
      const publishedDecksData = await fetchPublishedDecks();
      setPublishedDecks(publishedDecksData.$values || []);
    } catch (error) {
      console.error('Failed to load decks:', error);
    }
  };

  const handleOpenWizard = () => {
    setOpenWizard(true);
  };

  const handleCloseWizard = () => {
    setOpenWizard(false);
    refreshDecks();
  };

  const handleOpenEditWizard = async (deck) => {
    try {
      const deckWithCards = await fetchDeckWithCards(deck.deckId);
      setDeckToEdit(deckWithCards);
      setOpenEditWizard(true);
    } catch (error) {
      console.error('Failed to fetch deck with cards:', error);
    }
  };

  const handleCloseEditWizard = () => {
    setOpenEditWizard(false);
    setDeckToEdit(null);
    refreshDecks();
  };

  const handleDeleteDeck = async () => {
    if (!deckToDelete) return;
    const token = getAuthToken();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}api/Decks/${deckToDelete.deckId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete deck');
      setDeleteDialogOpen(false);
      refreshDecks();
    } catch (error) {
      console.error('Failed to delete deck:', error);
    }
  };

  const openDeleteDialog = (deck) => {
    setDeckToDelete(deck);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeckToDelete(null);
  };

  const handleOpenLearningDialog = async (deck) => {
    try {
      const deckWithCards = await fetchDeckWithCards(deck.deckId);
      setDeckToLearn(deckWithCards);
      setLearningDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch deck with cards:', error);
    }
  };

  const handleCloseLearningDialog = () => {
    setLearningDialogOpen(false);
    setDeckToLearn(null);
  };

  const handleStartLearning = (progressDeckId) => {
    setLearningDialogOpen(false);
    navigate(`/progress/${progressDeckId}`);
  };

  const handlePublishChange = async (deckId, isPublished) => {
    try {
      await updatePublishStatus(deckId, isPublished);
      refreshDecks();
    } catch (error) {
      console.error('Failed to update publish status:', error);
    }
  };

  return (
    <Layout>
      <Box sx={{ flexGrow: 1, padding: 2 }}>
        <Button variant="contained" color="primary" onClick={handleOpenWizard} sx={{ marginBottom: 1 }}>
          Create Deck
        </Button>
        <Divider sx={{ marginY: 2 }} />
        <Typography variant="h6" gutterBottom>
          My Decks
        </Typography>
        <Grid container spacing={2}>
          {myDecks.map((deck) => (
            <Grid item key={deck.deckId} xs={12} sm={6} md={4}>
              <Card variant="outlined" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="div" gutterBottom>
                    {deck.deckName}
                  </Typography>
                  <Typography variant="body1">{deck.deckDescription}</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenLearningDialog(deck)}
                    sx={{ marginTop: 2 }}
                  >
                    Start Learning
                  </Button>
                </CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 1 }}>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenEditWizard(deck)}
                  >
                    <EditIcon />
                  </IconButton>
                  <Switch
                    checked={deck.isPublished}
                    onChange={(e) => handlePublishChange(deck.deckId, e.target.checked)}
                    color="primary"
                  />
                  <IconButton
                    color="error"
                    onClick={() => openDeleteDialog(deck)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ marginY: 2 }} />
        <Typography variant="h6" gutterBottom>
          Published Decks
        </Typography>
        <Grid container spacing={2}>
          {publishedDecks.map((deck) => (
            <Grid item key={deck.deckId} xs={12} sm={6} md={4}>
              <Card variant="outlined" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="div" gutterBottom>
                    {deck.deckName}
                  </Typography>
                  <Typography variant="body1">{deck.deckDescription}</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenLearningDialog(deck)}
                    sx={{ marginTop: 2 }}
                  >
                    Start Learning
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      <DeckCreationWizard open={openWizard} onClose={handleCloseWizard} onDeckCreated={refreshDecks} />
      <DeckEditWizard open={openEditWizard} onClose={handleCloseEditWizard} deck={deckToEdit} onDeckUpdated={refreshDecks} />

      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Do you really want to delete the {deckToDelete?.deckName} deck?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">No</Button>
          <Button onClick={handleDeleteDeck} color="primary">Yes</Button>
        </DialogActions>
      </Dialog>

      <StartDeckLearningDialog
        open={learningDialogOpen}
        onClose={handleCloseLearningDialog}
        deck={deckToLearn}
        onStartLearning={handleStartLearning}
      />
    </Layout>
  );
}

export default LanguagePage;

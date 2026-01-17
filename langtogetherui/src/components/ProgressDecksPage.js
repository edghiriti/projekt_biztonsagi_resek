import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import Layout from './Layout';
import CreateGroupDialog from './CreateGroupDialog'; 

const fetchProgressDecks = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${process.env.REACT_APP_API_URL}api/ProgressDecks`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch progress decks');
  return await response.json();
};

const deleteProgressDeck = async (progressDeckId) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${process.env.REACT_APP_API_URL}api/ProgressDecks/${progressDeckId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to delete progress deck');
};

const updateDailyCardLimit = async (progressDeckId, dailyCardLimit) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${process.env.REACT_APP_API_URL}api/ProgressDecks/${progressDeckId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ dailyCardLimit })
  });
  if (!response.ok) throw new Error('Failed to update daily card limit');
};

function ProgressDecksPage() {
  const [progressDecks, setProgressDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deckToEdit, setDeckToEdit] = useState(null);
  const [dailyCardLimit, setDailyCardLimit] = useState(20);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProgressDecks = async () => {
      try {
        const data = await fetchProgressDecks();
        setProgressDecks(data.$values || []);
      } catch (error) {
        console.error('Failed to load progress decks:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProgressDecks();
  }, []);

  const handleOpenDeleteDialog = (deck) => {
    setDeckToDelete(deck);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeckToDelete(null);
  };

  const handleDeleteDeck = async () => {
    if (!deckToDelete) return;
    try {
      await deleteProgressDeck(deckToDelete.progressDeckId);
      setProgressDecks(progressDecks.filter(deck => deck.progressDeckId !== deckToDelete.progressDeckId));
    } catch (error) {
      console.error('Failed to delete deck:', error);
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleOpenEditDialog = (deck) => {
    setDeckToEdit(deck);
    setDailyCardLimit(deck.dailyCardLimit);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setDeckToEdit(null);
  };

  const handleSaveDailyCardLimit = async () => {
    if (!deckToEdit) return;
    try {
      await updateDailyCardLimit(deckToEdit.progressDeckId, dailyCardLimit);
      const updatedDecks = progressDecks.map(deck => {
        if (deck.progressDeckId === deckToEdit.progressDeckId) {
          return { ...deck, dailyCardLimit };
        }
        return deck;
      });
      setProgressDecks(updatedDecks);
    } catch (error) {
      console.error('Failed to update daily card limit:', error);
    } finally {
      handleCloseEditDialog();
    }
  };

  const handleOpenGroupDialog = (deckId) => {
    setSelectedDeckId(deckId);
    setGroupDialogOpen(true);
  };

  const handleCloseGroupDialog = () => {
    setGroupDialogOpen(false);
    setSelectedDeckId(null);
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Layout>
      <Box sx={{ padding: 2 }}>
        <Typography variant="h4" gutterBottom>
          My Progress Decks
        </Typography>
        <List>
          {progressDecks.map((deck) => (
            <ListItem
              button
              key={deck.progressDeckId}
              onClick={() => navigate(`/progress/${deck.progressDeckId}`)}
            >
              <Paper sx={{ padding: 2, width: '100%', position: 'relative' }}>
                <ListItemText
                  primary={deck.progressDeckName || 'Unnamed Deck'}
                  secondary={deck.progressDeckDescription || ''}
                />
                <IconButton
                  sx={{ position: 'absolute', top: '8px', right: '8px', color: 'red' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDeleteDialog(deck);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
                <IconButton
                  sx={{ position: 'absolute', top: '8px', right: '48px', color: 'blue' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEditDialog(deck);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  sx={{ position: 'absolute', top: '8px', right: '88px', color: 'green' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/progress/${deck.progressDeckId}/statistics`);
                  }}
                >
                  <BarChartIcon />
                </IconButton>
                <IconButton
                  sx={{ position: 'absolute', top: '8px', right: '128px', color: 'purple' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenGroupDialog(deck.progressDeckId);
                  }}
                >
                  <GroupAddIcon />
                </IconButton>
              </Paper>
            </ListItem>
          ))}
        </List>

        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Do you really want to delete the {deckToDelete?.progressDeckName || 'unnamed'} deck?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} color="primary">Cancel</Button>
            <Button onClick={handleDeleteDeck} color="primary">Delete</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Edit Daily Card Limit</DialogTitle>
          <DialogContent>
            <TextField
              label="Daily Card Limit"
              type="number"
              value={dailyCardLimit}
              onChange={(e) => setDailyCardLimit(parseInt(e.target.value, 10))}
              fullWidth
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog} color="primary">Cancel</Button>
            <Button onClick={handleSaveDailyCardLimit} variant="contained" color="primary">Save</Button>
          </DialogActions>
        </Dialog>

        <CreateGroupDialog
          open={groupDialogOpen}
          onClose={handleCloseGroupDialog}
          progressDeckId={selectedDeckId}
        />
      </Box>
    </Layout>
  );
}

export default ProgressDecksPage;

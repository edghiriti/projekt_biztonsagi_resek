import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  IconButton,
  Typography,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { FixedSizeList as List } from 'react-window';

const Row = ({ index, style, data }) => {
  const { cards, handleCardChange, addCard, removeCard, errors } = data;

  return (
    <div style={{ ...style, display: 'flex', alignItems: 'center', gap: '10px' }}>
      <TextField
        fullWidth
        label="Front"
        variant="outlined"
        value={cards[index].front}
        onChange={(e) => handleCardChange(index, 'front', e.target.value)}
        error={!!errors.cards[index]?.front}
        helperText={errors.cards[index]?.front ? 'Required' : ''}
      />
      <TextField
        fullWidth
        label="Back"
        variant="outlined"
        value={cards[index].back}
        onChange={(e) => handleCardChange(index, 'back', e.target.value)}
        error={!!errors.cards[index]?.back}
        helperText={errors.cards[index]?.back ? 'Required' : ''}
      />
      <IconButton onClick={() => addCard(index + 1)} color="primary">
        <AddCircleOutlineIcon />
      </IconButton>
      {cards.length > 1 && (
        <IconButton onClick={() => removeCard(index)} color="secondary">
          <RemoveCircleOutlineIcon />
        </IconButton>
      )}
    </div>
  );
};

const getAuthToken = () => localStorage.getItem('authToken');

function DeckCreationWizard({ open, onClose, onDeckCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState([{ front: '', back: '' }]);
  const [errors, setErrors] = useState({ name: '', cards: {} });
  const [currentStep, setCurrentStep] = useState(1);
  const [showImport, setShowImport] = useState(true);
  const [creating, setCreating] = useState(false);

  const resetState = () => {
    setName('');
    setDescription('');
    setCards([{ front: '', back: '' }]);
    setErrors({ name: '', cards: {} });
    setCurrentStep(1);
    setShowImport(true);
    setCreating(false);
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleCreate = async () => {
    if (validateForm()) {
      setCreating(true);
      const deckData = {
        deckName: name,
        deckDescription: description,
        cards: cards.map((card, index) => ({
          cardIndex: index,
          front: card.front,
          back: card.back
        })),
        progressDecks: []
      };
      try {
        const token = getAuthToken();
        const response = await fetch(`${process.env.REACT_APP_API_URL}api/Decks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(deckData)
        });
        if (!response.ok) throw new Error('Failed to create deck');
        
        await response.text();
        
        resetState();
        onClose();
        setTimeout(onDeckCreated, 2000);
      } catch (error) {
        console.error('Failed to create deck:', error);
        setCreating(false);
      }
    }
  };

  const addCard = (index) => {
    const newCards = [...cards];
    newCards.splice(index, 0, { front: '', back: '' });
    setCards(newCards);
  };

  const removeCard = (index) => {
    const newCards = [...cards];
    newCards.splice(index, 1);
    setCards(newCards);
  };

  const handleCardChange = (index, side, value) => {
    const newCards = [...cards];
    newCards[index][side] = value;
    setCards(newCards);

    const newErrors = { ...errors };
    if (!newErrors.cards[index]) {
      newErrors.cards[index] = {};
    }
    if (!value.trim()) {
      newErrors.cards[index][side] = 'Required';
    } else {
      delete newErrors.cards[index][side];
    }
    if (Object.keys(newErrors.cards[index]).length === 0) {
      delete newErrors.cards[index];
    }
    setErrors(newErrors);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const text = await file.text();
      try {
        const json = JSON.parse(text);
        const newCards = Object.entries(json).map(([key, value]) => ({
          front: key,
          back: value
        }));
        const filteredCards = newCards.filter(card => card.front.trim() && card.back.trim());
        setCards([...cards.filter(card => card.front.trim() && card.back.trim()), ...filteredCards]);
        setShowImport(false);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        alert('Invalid JSON file');
      }
    }
  };

  const validateStep1 = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!name.trim()) {
      newErrors.name = 'Deck name is required';
      isValid = false;
    } else {
      newErrors.name = '';
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', cards: {} };

    if (!name.trim()) {
      newErrors.name = 'Deck name is required';
      isValid = false;
    }

    cards.forEach((card, i) => {
      if (!card.front.trim() || !card.back.trim()) {
        newErrors.cards[i] = {};
        if (!card.front.trim()) {
          newErrors.cards[i].front = 'Required';
        }
        if (!card.back.trim()) {
          newErrors.cards[i].back = 'Required';
        }
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        style: {
          minHeight: '80vh',
        },
      }}
    >
      <DialogTitle>{currentStep === 1 ? 'Create a New Deck' : 'Add Cards to Deck'}</DialogTitle>
      <DialogContent dividers>
        {currentStep === 1 ? (
          <>
            <TextField
              autoFocus
              margin="dense"
              label="Deck Name"
              type="text"
              fullWidth
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              margin="dense"
              label="Description"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </>
        ) : (
          <>
            <List
              height={800}
              width="100%"
              itemCount={cards.length}
              itemSize={70}
              itemData={{ cards, handleCardChange, addCard, removeCard, errors }}
            >
              {Row}
            </List>
            {showImport && (
              <>
                <Typography variant="body2" gutterBottom style={{ marginTop: 20 }}>
                  Import:
                </Typography>
                <Button
                  variant="contained"
                  component="label"
                  sx={{ marginBottom: 1 }}
                >
                  Upload File
                  <input
                    type="file"
                    hidden
                    accept=".json"
                    onChange={handleFileChange}
                  />
                </Button>
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        {currentStep === 2 && <Button onClick={handleBack}>Back</Button>}
        <Button onClick={handleClose}>Cancel</Button>
        {currentStep === 1 ? (
          <Button onClick={handleNext}>Next</Button>
        ) : (
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? 'Creating...' : 'Create'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default DeckCreationWizard;

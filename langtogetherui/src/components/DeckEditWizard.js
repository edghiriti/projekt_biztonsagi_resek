import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { FixedSizeList as List } from 'react-window';

const getAuthToken = () => localStorage.getItem('authToken');

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

function DeckEditWizard({ open, onClose, deck, onDeckUpdated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState([{ front: '', back: '' }]);
  const [errors, setErrors] = useState({ name: '', cards: {} });
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (deck) {
      setName(deck.deckName);
      setDescription(deck.deckDescription);
      setCards(deck.cards.$values.map(card => ({ front: card.front, back: card.back })));
    }
  }, [deck]);

  const resetState = () => {
    setName('');
    setDescription('');
    setCards([{ front: '', back: '' }]);
    setErrors({ name: '', cards: {} });
    setCurrentStep(1);
    setSaving(false);
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

  const handleSave = async () => {
    if (validateForm()) {
      setSaving(true);
      const deckData = {
        deckId: deck.deckId,
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
        const response = await fetch(`${process.env.REACT_APP_API_URL}api/Decks/${deck.deckId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(deckData)
        });
        if (!response.ok) throw new Error('Failed to update deck');

        await response.text();

        resetState();
        onClose();
        setTimeout(onDeckUpdated, 2000);
      } catch (error) {
        console.error('Failed to update deck:', error);
        setSaving(false);
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

  if (!deck) return null;

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
      <DialogTitle>{currentStep === 1 ? 'Edit Deck' : 'Edit Cards'}</DialogTitle>
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
          </>
        )}
      </DialogContent>
      <DialogActions>
        {currentStep === 2 && <Button onClick={handleBack}>Back</Button>}
        <Button onClick={handleClose}>Cancel</Button>
        {currentStep === 1 ? (
          <Button onClick={handleNext}>Next</Button>
        ) : (
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default DeckEditWizard;

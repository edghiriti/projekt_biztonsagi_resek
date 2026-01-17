import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';

const createGroup = async (groupName, groupDescription, members, progressDeckId) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${process.env.REACT_APP_API_URL}api/Groups/CreateGroupWithInvitations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: groupName,
      description: groupDescription,
      members,
      progressDeckId,
    }),
  });
  if (!response.ok) throw new Error('Failed to create group');
  return await response.json();
};

function CreateGroupDialog({ open, onClose, progressDeckId }) {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [newMember, setNewMember] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [error, setError] = useState(null);

  const handleAddMember = () => {
    if (newMember && !groupMembers.includes(newMember)) {
      setGroupMembers([...groupMembers, newMember]);
      setNewMember('');
    }
  };

  const handleCreateGroup = async () => {
    try {
      await createGroup(groupName, groupDescription, groupMembers, progressDeckId);
      onClose();
    } catch (error) {
      console.error('Failed to create group:', error);
      setError('Failed to create group.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Group</DialogTitle>
      <DialogContent>
        {error && <Typography color="error">{error}</Typography>}
        <TextField
          label="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Description"
          value={groupDescription}
          onChange={(e) => setGroupDescription(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Add Member"
          value={newMember}
          onChange={(e) => setNewMember(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddMember();
            }
          }}
          fullWidth
          margin="normal"
        />
        <Button onClick={handleAddMember} sx={{ marginTop: 1, marginBottom: 2 }}>
          Add Member
        </Button>
        <Box>
          {groupMembers.map((member, index) => (
            <Typography key={index} variant="body1">
              {member}
            </Typography>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleCreateGroup} variant="contained" color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateGroupDialog;

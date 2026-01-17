import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const fetchGroupUsers = async (groupId) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${process.env.REACT_APP_API_URL}api/Groups/${groupId}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch group users');
  return await response.json();
};

const addUserToGroup = async (groupId, userName) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${process.env.REACT_APP_API_URL}api/Groups/${groupId}/adduser`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ userName }),
  });
  if (!response.ok) throw new Error('Failed to add user to group');
  return await response.json();
};

const removeUserFromGroup = async (groupId, userName) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${process.env.REACT_APP_API_URL}api/Groups/${groupId}/users/${userName}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to remove user from group');
};

const GroupUsersDialog = ({ open, onClose, groupId, isOwner }) => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      const loadGroupUsers = async () => {
        try {
          const usersData = await fetchGroupUsers(groupId);
          setUsers(usersData.$values || []);
        } catch (error) {
          console.error('Failed to fetch group users:', error);
        }
      };

      loadGroupUsers();
    }
  }, [open, groupId]);

  const handleAddUser = async () => {
    if (newUser && !users.some(user => user.userName === newUser)) {
      try {
        await addUserToGroup(groupId, newUser);
        setUsers([...users, { userName: newUser }]);
        setNewUser('');
      } catch (error) {
        console.error('Failed to add user to group:', error);
        setError('Failed to add user to group.');
      }
    }
  };

  const handleRemoveUser = async (userName) => {
    try {
      await removeUserFromGroup(groupId, userName);
      setUsers(users.filter(user => user.userName !== userName));
    } catch (error) {
      console.error('Failed to remove user from group:', error);
      setError('Failed to remove user from group.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Group Members</DialogTitle>
      <DialogContent>
        {error && <Typography color="error">{error}</Typography>}
        <List>
          {users.map(user => (
            <ListItem key={user.userName}>
              <ListItemText primary={user.userName} />
              {isOwner && (
                <IconButton
                  edge="end"
                  aria-label="delete"
                  color="error"
                  onClick={() => handleRemoveUser(user.userName)}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </ListItem>
          ))}
        </List>
        {isOwner && (
          <>
            <TextField
              label="Add Member"
              value={newUser}
              onChange={(e) => setNewUser(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddUser();
                }
              }}
              fullWidth
              margin="normal"
            />
            <Button
              onClick={handleAddUser}
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              sx={{ marginTop: 1 }}
              fullWidth
            >
              Add Member
            </Button>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroupUsersDialog;

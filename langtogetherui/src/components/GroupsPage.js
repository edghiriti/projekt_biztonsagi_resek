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
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import Layout from './Layout';
import GroupUsersDialog from './GroupUsersDialog';

const fetchGroups = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${process.env.REACT_APP_API_URL}api/Groups`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch groups');
  return await response.json();
};

const fetchInvitations = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${process.env.REACT_APP_API_URL}api/groups/invitations`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch invitations');
  return await response.json();
};

const acceptInvitation = async (invitationId) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${process.env.REACT_APP_API_URL}api/Groups/${invitationId}/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  const result = await response.json();
  if (!response.ok) {
    if (result.message.includes("Deck was not found")) {
      throw new Error("DeckNotFound");
    }
    throw new Error('Failed to accept invitation');
  }
  return result;
};

const declineInvitation = async (invitationId) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${process.env.REACT_APP_API_URL}api/Groups/${invitationId}/decline`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to decline invitation');
};

function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invitationsOpen, setInvitationsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [groupUsersDialogOpen, setGroupUsersDialogOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const navigate = useNavigate();
  const currentUser = localStorage.getItem('userName');

  useEffect(() => {
    const loadData = async () => {
      try {
        const groupsData = await fetchGroups();
        setGroups(groupsData.$values || []);

        const invitationsData = await fetchInvitations();
        setInvitations(invitationsData.$values || []);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAccept = async (invitationId) => {
    try {
      await acceptInvitation(invitationId);
      setInvitations(invitations.filter(inv => inv.invitationId !== invitationId));
      const groupsData = await fetchGroups();
      setGroups(groupsData.$values || []);
    } catch (error) {
      if (error.message === "DeckNotFound") {
        setInvitations(invitations.filter(inv => inv.invitationId !== invitationId));
        setErrorMessage("Deck was not found, invitation removed.");
      } else {
        console.error('Failed to accept invitation:', error);
        setErrorMessage('Failed to accept invitation.');
      }
    }
  };

  const handleDecline = async (invitationId) => {
    try {
      await declineInvitation(invitationId);
      setInvitations(invitations.filter(inv => inv.invitationId !== invitationId));
    } catch (error) {
      console.error('Failed to decline invitation:', error);
      setErrorMessage('Failed to decline invitation.');
    }
  };

  const toggleInvitations = () => {
    setInvitationsOpen(!invitationsOpen);
  };

  const handleCloseError = () => {
    setErrorMessage(null);
  };

  const handleOpenGroupUsersDialog = (groupId) => {
    setCurrentGroup(groupId);
    setGroupUsersDialogOpen(true);
  };

  const handleCloseGroupUsersDialog = () => {
    setGroupUsersDialogOpen(false);
    setCurrentGroup(null);
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Layout>
      <Box sx={{ padding: 2 }}>
        <Typography variant="h4" gutterBottom>
          My Groups
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={toggleInvitations}
          endIcon={invitationsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          Pending Invitations ({invitations.length})
        </Button>
        <Collapse in={invitationsOpen}>
          <List>
            {invitations.map((invitation) => (
              <ListItem key={invitation.invitationId} sx={{ backgroundColor: '#f5f5f5', margin: '10px 0', borderRadius: 1 }}>
                <ListItemText
                  primary={`Invitation from ${invitation.senderName}`}
                  secondary={
                    <Box>
                      <Typography component="span" variant="body2">
                        <strong>Group:</strong> {invitation.groupName} - {invitation.groupDescription}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2">
                        <strong>Deck:</strong> {invitation.deckName} ({invitation.numberOfCards} cards) - {invitation.deckDescription}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2">
                        <strong>Invitation Date:</strong> {new Date(invitation.invitationDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
                <IconButton
                  color="success"
                  onClick={() => handleAccept(invitation.invitationId)}
                >
                  <CheckIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDecline(invitation.invitationId)}
                >
                  <CloseIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
        <List>
          {groups.map((group) => (
            <ListItem
              button
              key={group.groupId}
              onClick={() => navigate(`/groups/${group.groupId}/statistics`)}
            >
              <Paper sx={{ padding: 2, width: '100%', position: 'relative' }}>
                <ListItemText
                  primary={group.name || 'Unnamed Group'}
                  secondary={group.description || ''}
                />
                <IconButton
                  sx={{ position: 'absolute', top: '8px', right: '48px', color: 'blue' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenGroupUsersDialog(group.groupId);
                  }}
                >
                  <GroupIcon />
                </IconButton>
              </Paper>
            </ListItem>
          ))}
        </List>
      </Box>
      <GroupUsersDialog
        open={groupUsersDialogOpen}
        onClose={handleCloseGroupUsersDialog}
        groupId={currentGroup}
        isOwner={groups.find(group => group.groupId === currentGroup)?.ownerName === currentUser}
      />
      <Dialog
        open={!!errorMessage}
        onClose={handleCloseError}
      >
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {errorMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseError} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

export default GroupsPage;

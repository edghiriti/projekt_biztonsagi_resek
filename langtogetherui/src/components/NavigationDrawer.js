import React from 'react';
import { Link } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import LanguageIcon from '@mui/icons-material/Language';
import ProgressIcon from '@mui/icons-material/TrendingUp';

function NavigationDrawer({ drawerOpen, toggleDrawer }) {
    return (
        <Drawer
            variant="permanent"
            open={drawerOpen}
            onClose={toggleDrawer}
            sx={{
                width: drawerOpen ? 240 : 0,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerOpen ? 240 : 0,
                    boxSizing: 'border-box',
                },
            }}
        >
            <List>
                <ListItem button component={Link} to="/dashboard">
                    <ListItemIcon><HomeIcon /></ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem button component={Link} to="/groups">
                    <ListItemIcon><GroupIcon /></ListItemIcon>
                    <ListItemText primary="Groups" />
                </ListItem>
                <ListItem button component={Link} to="/languages">
                    <ListItemIcon><LanguageIcon /></ListItemIcon>
                    <ListItemText primary="Learn New Languages" />
                </ListItem>
                <ListItem button component={Link} to="/progress">
                    <ListItemIcon><ProgressIcon /></ListItemIcon>
                    <ListItemText primary="My Progress" />
                </ListItem>
            </List>
        </Drawer>
    );
}

export default NavigationDrawer;

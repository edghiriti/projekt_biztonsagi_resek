import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

function HeaderAppBar({ onMenuClick, drawerOpen }) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar 
            position="fixed" 
            sx={{ 
                zIndex: (theme) => theme.zIndex.drawer + 1, 
                width: `calc(100% - ${drawerOpen ? 240 : 0}px)`, 
                transition: 'margin 0.5s', 
                marginLeft: `${drawerOpen ? 240 : 0}px`
            }}
        >
            <Toolbar>
                <IconButton 
                    edge="start" 
                    color="inherit" 
                    aria-label="menu" 
                    onClick={onMenuClick}
                >
                    <MenuIcon />
                </IconButton>
                <Typography 
                    variant="h6" 
                    component="div" 
                    sx={{ flexGrow: 1 }}
                >
                    {localStorage.getItem('userName') || 'Welcome'}
                </Typography>
                <Button 
                    color="inherit" 
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </Toolbar>
        </AppBar>
    );
}

export default HeaderAppBar;

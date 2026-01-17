
import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import HeaderAppBar from './HeaderAppBar';
import NavigationDrawer from './NavigationDrawer';

function Layout({ children }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <HeaderAppBar onMenuClick={toggleDrawer} drawerOpen={drawerOpen} />
            <NavigationDrawer drawerOpen={drawerOpen} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: `calc(100% - ${drawerOpen ? 240 : 0}px)`,
                    transition: 'margin 0.5s',
                    marginLeft: `${drawerOpen ? 240 : 0}px`,
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}

export default Layout;

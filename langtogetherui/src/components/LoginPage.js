import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography,
  Paper,
  Grid,
} from "@mui/material";
import { styled } from "@mui/system";
import backgroundImage from '../resources/langtogether.jpeg';

const Root = styled(Box)({
  height: '100vh',
  backgroundImage: `url(${backgroundImage})`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: '75%',
  backgroundPosition: 'center',
  backgroundColor: '#b3e5fc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  borderRadius: theme.shape.borderRadius,
  maxWidth: 400,
  width: '100%',
  textAlign: 'center',
}));

const Form = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch(`${process.env.REACT_APP_API_URL}api/authentication/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
      const { token, userName } = await response.json();
      auth.login(token, userName);
      navigate("/dashboard");
    } else {
      console.error('Login failed');
    }
  };

  return (
    <Root>
      <CssBaseline />
      <Container component="main" maxWidth="xs">
        <StyledPaper>
          <Typography component="h1" variant="h5">
            Welcome
          </Typography>
          <Form onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <SubmitButton
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
            >
              Login
            </SubmitButton>
            <Grid container justifyContent="center">
              <Grid item>
                <Link to="/register">
                  No account yet? Register here
                </Link>
              </Grid>
            </Grid>
          </Form>
        </StyledPaper>
      </Container>
    </Root>
  );
}

export default LoginPage;

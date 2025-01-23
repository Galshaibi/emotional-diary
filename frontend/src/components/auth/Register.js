import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert
} from '@mui/material';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/register`,
        {
          ...formData,
          user_type: 'PATIENT'
        }
      );

      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.detail || 'שגיאה בהרשמה. נסה שוב מאוחר יותר.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          הרשמה
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="שם פרטי"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            autoFocus
            InputProps={{
              style: { textAlign: 'right' }
            }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="שם משפחה"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            InputProps={{
              style: { textAlign: 'right' }
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="אימייל"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            InputProps={{
              style: { textAlign: 'right' }
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="סיסמה"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            InputProps={{
              style: { textAlign: 'right' }
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            הרשמה
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/login')}
          >
            כבר יש לך חשבון? התחבר
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;

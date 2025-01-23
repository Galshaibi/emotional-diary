import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    userType: 'PATIENT',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // בדיקת שדות חובה
      if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
        setError('נא למלא את כל שדות החובה');
        setLoading(false);
        return;
      }

      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError('הסיסמאות אינן תואמות');
        setLoading(false);
        return;
      }

      // Validate password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        setError('הסיסמה חייבת להכיל לפחות 8 תווים, אות גדולה, אות קטנה, מספר ותו מיוחד');
        setLoading(false);
        return;
      }

      const userData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        user_type: formData.userType
      };

      console.log('Sending registration data:', JSON.stringify(userData, null, 2));
      
      try {
        const response = await axios.post(`${API_URL}/users/`, userData, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        });
        console.log('Registration response:', response.data);

        // After successful registration, log in automatically
        const loginResponse = await axios.post(`${API_URL}/auth/token`, 
          new URLSearchParams({
            username: formData.email,
            password: formData.password,
          }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        console.log('Login response:', loginResponse.data);
        console.log('Login response status:', loginResponse.status);
        console.log('Login response headers:', loginResponse.headers);
        console.log('Login response config:', loginResponse.config);

        localStorage.setItem('token', loginResponse.data.access_token);
        localStorage.setItem('user_type', loginResponse.data.user_type);
        localStorage.setItem('user', JSON.stringify(loginResponse.data.user));

        // Redirect based on user type
        if (loginResponse.data.user_type === 'THERAPIST') {
          navigate('/dashboard/therapist');
        } else {
          navigate('/dashboard/patient');
        }
      } catch (error) {
        console.error('Registration error full details:', {
          message: error.message,
          response: error.response?.data,
          request: error.request,
          config: error.config
        });
        console.error('Registration error:', error);
        console.error('Registration error response:', error.response);
        console.error('Registration error response data:', error.response?.data);
        if (error.response?.data?.detail) {
          console.error('Validation errors:', JSON.stringify(error.response.data.detail, null, 2));
        }
        const errorDetail = error.response?.data?.detail;
        setError(Array.isArray(errorDetail) ? 
          errorDetail.map(err => err.msg || err.message).join(', ') : 
          (typeof errorDetail === 'string' ? errorDetail : 'שגיאה בהרשמה'));
        throw error;
      } finally {
        setLoading(false);
      }
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Registration error response:', err.response);
      console.error('Registration error response data:', err.response?.data);
      if (err.response?.data?.detail) {
        console.error('Validation errors:', JSON.stringify(err.response.data.detail, null, 2));
      }
      const errorDetail = err.response?.data?.detail;
      setError(Array.isArray(errorDetail) ? 
        errorDetail.map(err => err.msg || err.message).join(', ') : 
        (typeof errorDetail === 'string' ? errorDetail : 'שגיאה בהרשמה'));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            הרשמה
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="אימייל"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              error={!formData.email}
              helperText={!formData.email ? 'שדה חובה' : ''}
              autoComplete="email"
              autoFocus
              dir="ltr"
            />

            <TextField
              fullWidth
              label="שם פרטי"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              margin="normal"
              required
              error={!formData.firstName}
              helperText={!formData.firstName ? 'שדה חובה' : ''}
            />

            <TextField
              fullWidth
              label="שם משפחה"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              margin="normal"
              required
              error={!formData.lastName}
              helperText={!formData.lastName ? 'שדה חובה' : ''}
            />

            <TextField
              fullWidth
              label="סיסמה"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              error={!formData.password}
              helperText={!formData.password ? 'שדה חובה' : ''}
              autoComplete="new-password"
              dir="ltr"
            />

            <TextField
              fullWidth
              label="אימות סיסמה"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              error={!formData.confirmPassword || formData.password !== formData.confirmPassword}
              helperText={!formData.confirmPassword ? 'שדה חובה' : 
                         formData.password !== formData.confirmPassword ? 'הסיסמאות אינן תואמות' : ''}
              autoComplete="new-password"
              dir="ltr"
            />

            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">סוג משתמש</FormLabel>
              <RadioGroup
                row
                name="userType"
                value={formData.userType}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="PATIENT"
                  control={<Radio />}
                  label="מטופל"
                />
                <FormControlLabel
                  value="THERAPIST"
                  control={<Radio />}
                  label="מטפל"
                />
              </RadioGroup>
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'הירשם'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link href="/login" variant="body2">
                {"יש לך כבר חשבון? התחבר"}
              </Link>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;

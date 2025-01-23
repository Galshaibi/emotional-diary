import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const [error, setError] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const { login, verify2FA } = useAuth();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      twoFactorCode: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('כתובת אימייל לא תקינה')
        .required('שדה חובה'),
      password: Yup.string()
        .min(8, 'סיסמה חייבת להכיל לפחות 8 תווים')
        .required('שדה חובה'),
      twoFactorCode: Yup.string().when('showTwoFactor', {
        is: true,
        then: Yup.string()
          .length(6, 'קוד אימות חייב להכיל 6 ספרות')
          .required('שדה חובה'),
      }),
    }),
    onSubmit: async (values) => {
      try {
        setError('');
        if (!showTwoFactor) {
          const response = await login(values.email, values.password);
          if (response.requires_2fa) {
            setShowTwoFactor(true);
          }
        } else {
          await verify2FA(values.email, values.twoFactorCode);
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'שגיאה בהתחברות');
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          {showTwoFactor ? 'אימות דו-שלבי' : 'התחברות'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={formik.handleSubmit}>
          {!showTwoFactor ? (
            <>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="אימייל"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                margin="normal"
                dir="rtl"
              />
              <TextField
                fullWidth
                id="password"
                name="password"
                label="סיסמה"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                margin="normal"
                dir="rtl"
              />
            </>
          ) : (
            <TextField
              fullWidth
              id="twoFactorCode"
              name="twoFactorCode"
              label="קוד אימות"
              value={formik.values.twoFactorCode}
              onChange={formik.handleChange}
              error={formik.touched.twoFactorCode && Boolean(formik.errors.twoFactorCode)}
              helperText={formik.touched.twoFactorCode && formik.errors.twoFactorCode}
              margin="normal"
              dir="rtl"
            />
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {showTwoFactor ? 'אמת קוד' : 'התחבר'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginForm;

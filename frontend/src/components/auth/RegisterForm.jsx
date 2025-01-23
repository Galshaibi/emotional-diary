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
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = () => {
  const [error, setError] = useState('');
  const { register } = useAuth();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      isTherapist: false,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('כתובת אימייל לא תקינה')
        .required('שדה חובה'),
      password: Yup.string()
        .min(8, 'סיסמה חייבת להכיל לפחות 8 תווים')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'סיסמה חייבת להכיל אות גדולה, אות קטנה ומספר'
        )
        .required('שדה חובה'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'סיסמאות לא תואמות')
        .required('שדה חובה'),
      fullName: Yup.string()
        .min(2, 'שם חייב להכיל לפחות 2 תווים')
        .required('שדה חובה'),
    }),
    onSubmit: async (values) => {
      try {
        setError('');
        await register({
          email: values.email,
          password: values.password,
          full_name: values.fullName,
          is_therapist: values.isTherapist,
        });
      } catch (err) {
        setError(err.response?.data?.detail || 'שגיאה בהרשמה');
      }
    },
  });

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

        <Box component="form" onSubmit={formik.handleSubmit}>
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
            id="fullName"
            name="fullName"
            label="שם מלא"
            value={formik.values.fullName}
            onChange={formik.handleChange}
            error={formik.touched.fullName && Boolean(formik.errors.fullName)}
            helperText={formik.touched.fullName && formik.errors.fullName}
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

          <TextField
            fullWidth
            id="confirmPassword"
            name="confirmPassword"
            label="אימות סיסמה"
            type="password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
            margin="normal"
            dir="rtl"
          />

          <FormControlLabel
            control={
              <Switch
                checked={formik.values.isTherapist}
                onChange={formik.handleChange}
                name="isTherapist"
              />
            }
            label="אני מטפל/ת"
            sx={{ mt: 2 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            הרשמה
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterForm;

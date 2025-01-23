import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel,
  Checkbox,
  Fade,
  Grow,
} from '@mui/material';
import {
  SentimentVerySatisfied,
  SentimentSatisfied,
  SentimentNeutral,
  SentimentDissatisfied,
  SentimentVeryDissatisfied,
  MoodBad,
  Save as SaveIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const emotions = [
  { id: 'very_happy', label: 'מאוד שמח', icon: <SentimentVerySatisfied />, color: '#4caf50' },
  { id: 'happy', label: 'שמח', icon: <SentimentSatisfied />, color: '#8bc34a' },
  { id: 'neutral', label: 'נייטרלי', icon: <SentimentNeutral />, color: '#ffc107' },
  { id: 'sad', label: 'עצוב', icon: <SentimentDissatisfied />, color: '#ff9800' },
  { id: 'very_sad', label: 'מאוד עצוב', icon: <SentimentVeryDissatisfied />, color: '#f44336' },
  { id: 'angry', label: 'כועס', icon: <MoodBad />, color: '#d32f2f' },
];

const DiaryEntryForm = () => {
  const [formData, setFormData] = useState({
    emotion: '',
    date: new Date(),
    notes: '',
    self_harm: false,
    suicidal_thoughts: false,
    medications_taken: false,
    therapy_session: false,
    stressful_events: false,
  });
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const handleEmotionChange = (event, newEmotion) => {
    setFormData({ ...formData, emotion: newEmotion });
  };

  const handleDateChange = (newDate) => {
    setFormData({ ...formData, date: newDate });
  };

  const handleBehaviorChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.checked,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.emotion) {
      setError('אנא בחר רגש');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/diary/entries`,
        {
          emotion: formData.emotion,
          date: formData.date.toISOString(),
          notes: formData.notes,
          behaviors: {
            self_harm: formData.self_harm,
            suicidal_thoughts: formData.suicidal_thoughts,
            medications_taken: formData.medications_taken,
            therapy_session: formData.therapy_session,
            stressful_events: formData.stressful_events,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSnackbar({
        open: true,
        message: 'הרשומה נשמרה בהצלחה',
        severity: 'success',
      });

      // Navigate back after successful submission
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'שגיאה בשמירת הרשומה');
    }
  };

  const handleClear = () => {
    setFormData({
      emotion: '',
      date: new Date(),
      notes: '',
      self_harm: false,
      suicidal_thoughts: false,
      medications_taken: false,
      therapy_session: false,
      stressful_events: false,
    });
    setError('');
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Grow in>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
            רשומה חדשה ביומן
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  איך את/ה מרגיש/ה?
                </Typography>
                <ToggleButtonGroup
                  value={formData.emotion}
                  exclusive
                  onChange={handleEmotionChange}
                  aria-label="בחירת רגש"
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    justifyContent: 'center',
                  }}
                >
                  {emotions.map((emotion) => (
                    <ToggleButton
                      key={emotion.id}
                      value={emotion.id}
                      aria-label={emotion.label}
                      sx={{
                        borderRadius: '50%',
                        p: 2,
                        minWidth: 'auto',
                        '&.Mui-selected': {
                          backgroundColor: `${emotion.color}20`,
                          '&:hover': {
                            backgroundColor: `${emotion.color}30`,
                          },
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        {React.cloneElement(emotion.icon, {
                          sx: { fontSize: '2rem', color: emotion.color },
                        })}
                        <Typography variant="caption">{emotion.label}</Typography>
                      </Box>
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Grid>

              <Grid item xs={12}>
                <DateTimePicker
                  label="תאריך ושעה"
                  value={formData.date}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      dir: 'rtl',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="הערות"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="תוכל/י לכתוב כאן הערות נוספות..."
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  התנהגויות ואירועים
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.medications_taken}
                          onChange={handleBehaviorChange}
                          name="medications_taken"
                        />
                      }
                      label="נטלתי תרופות"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.therapy_session}
                          onChange={handleBehaviorChange}
                          name="therapy_session"
                        />
                      }
                      label="הייתי בטיפול"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.stressful_events}
                          onChange={handleBehaviorChange}
                          name="stressful_events"
                        />
                      }
                      label="חוויתי אירוע מלחיץ"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.self_harm}
                          onChange={handleBehaviorChange}
                          name="self_harm"
                          color="error"
                        />
                      }
                      label="פגיעה עצמית"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.suicidal_thoughts}
                          onChange={handleBehaviorChange}
                          name="suicidal_thoughts"
                          color="error"
                        />
                      }
                      label="מחשבות אובדניות"
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={handleClear}
                    startIcon={<ClearIcon />}
                  >
                    נקה טופס
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                  >
                    שמור רשומה
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Grow>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DiaryEntryForm;

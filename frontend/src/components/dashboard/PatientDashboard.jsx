import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  Chip,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  MoodBad,
  SentimentVeryDissatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
  SentimentVerySatisfied,
  Warning as WarningIcon,
  LocalHospital as MedicationIcon,
  Psychology as TherapyIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const emotionIcons = {
  'מאוד שמח': <SentimentVerySatisfied color="primary" />,
  'שמח': <SentimentSatisfied color="primary" />,
  'נייטרלי': <SentimentNeutral color="action" />,
  'עצוב': <SentimentDissatisfied color="warning" />,
  'מאוד עצוב': <SentimentVeryDissatisfied color="error" />,
  'כועס': <MoodBad color="error" />,
};

const behaviorIcons = {
  'self_harm': <WarningIcon color="error" />,
  'medications_taken': <MedicationIcon color="primary" />,
  'therapy_session': <TherapyIcon color="secondary" />,
  'stressful_events': <EventIcon color="warning" />,
};

const PatientDashboard = () => {
  const [emotionalData, setEmotionalData] = useState([]);
  const [behaviors, setBehaviors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/analytics/patient/dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setEmotionalData(response.data.emotional_data);
      setBehaviors(response.data.behaviors);
      setError('');
    } catch (err) {
      setError('שגיאה בטעינת הנתונים. נסה לרענן את הדף');
      setSnackbar({
        open: true,
        message: 'שגיאה בטעינת הנתונים. נסה שוב מאוחר יותר',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleNewEntry = () => {
    navigate('/diary/new');
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getBehaviorLabel = (behavior) => {
    const labels = {
      'self_harm': 'פגיעה עצמית',
      'medications_taken': 'נטילת תרופות',
      'therapy_session': 'טיפול',
      'stressful_events': 'אירועים מלחיצים',
    };
    return labels[behavior] || behavior;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, animation: 'fadeIn 0.5s ease-in' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            textAlign: 'center',
            flexGrow: 1
          }}
        >
          דשבורד אישי
        </Typography>
        <Box>
          <Tooltip title="רענן נתונים">
            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewEntry}
            sx={{ mr: 2 }}
          >
            רשומה חדשה
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            backgroundColor: 'rgba(253, 237, 237, 0.8)',
            '& .MuiAlert-icon': {
              color: '#d32f2f'
            }
          }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              נסה שוב
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Emotional Trends Chart */}
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              background: 'linear-gradient(to right, #ffffff, #f8f9fa)'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              מגמות רגשיות לאורך זמן
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={emotionalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), 'd/M', { locale: he })}
                  />
                  <YAxis domain={[0, 5]} />
                  <RechartsTooltip
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(date) => format(new Date(date), 'dd/MM/yyyy', { locale: he })}
                  />
                  <Legend />
                  {Object.keys(emotionIcons).map((emotion, index) => (
                    <Line
                      key={emotion}
                      type="monotone"
                      dataKey={emotion}
                      name={emotion}
                      stroke={`hsl(${index * 60}, 70%, 50%)`}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Behavior Summary */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {Object.entries(behaviors).map(([behavior, data]) => (
              <Grid item xs={12} sm={6} md={3} key={behavior}>
                <Fade in timeout={500}>
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 2
                        }}
                      >
                        {behaviorIcons[behavior]}
                        <Typography
                          variant="h6"
                          sx={{
                            mr: 1,
                            fontSize: '1.1rem',
                            fontWeight: 'medium'
                          }}
                        >
                          {getBehaviorLabel(behavior)}
                        </Typography>
                      </Box>
                      <Typography
                        variant="h4"
                        color={behavior === 'self_harm' ? 'error.main' : 'primary.main'}
                        sx={{ textAlign: 'center', mb: 1 }}
                      >
                        {((data.count / data.total) * 100).toFixed(1)}%
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textAlign: 'center' }}
                      >
                        {data.count} מתוך {data.total} ימים
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

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

export default PatientDashboard;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import axios from 'axios';
import { emotions } from '../../data/emotions';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const TherapistDashboard = () => {
  const [patientsSummary, setPatientsSummary] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchPatientsSummary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/analytics/therapist/patients/summary`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPatientsSummary(response.data);
    } catch (err) {
      setError('שגיאה בטעינת נתוני המטופלים');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientDetails = async (patientId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/analytics/therapist/patient/${patientId}/details`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date().toISOString(),
          },
        }
      );
      setPatientDetails(response.data);
      setDialogOpen(true);
    } catch (err) {
      setError('שגיאה בטעינת פרטי המטופל');
    }
  };

  useEffect(() => {
    fetchPatientsSummary();
  }, []);

  const getEmotionLabel = (emotionId) => {
    const emotion = emotions.find(e => e.id === emotionId);
    return emotion ? emotion.label : emotionId;
  };

  const prepareEmotionsChartData = () => {
    if (!patientDetails) return [];

    return patientDetails.dates.map((date, index) => {
      const dataPoint = {
        date: format(new Date(date), 'd/M/yyyy'),
      };

      Object.entries(patientDetails.emotions).forEach(([emotion, values]) => {
        dataPoint[emotion] = values[index];
      });

      return dataPoint;
    });
  };

  const renderPatientDialog = () => (
    <Dialog
      open={dialogOpen}
      onClose={() => setDialogOpen(false)}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        {selectedPatient && `ניתוח מפורט - ${selectedPatient.name}`}
      </DialogTitle>
      <DialogContent>
        {patientDetails && (
          <Grid container spacing={3}>
            {/* Emotions Chart */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    מגמות רגשיות
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prepareEmotionsChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Legend />
                        {Object.keys(patientDetails.emotions).map((emotion, index) => (
                          <Line
                            key={emotion}
                            type="monotone"
                            dataKey={emotion}
                            name={getEmotionLabel(emotion)}
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Behaviors Summary */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    סיכום התנהגויות
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(patientDetails.behaviors).map(([behavior, values]) => {
                      const count = values.filter(Boolean).length;
                      const percentage = (count / values.length) * 100;
                      return (
                        <Grid item xs={12} sm={6} md={3} key={behavior}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="subtitle1">
                              {behavior === 'self_harm' && 'פגיעה עצמית'}
                              {behavior === 'suicidal_thoughts' && 'מחשבות אובדניות'}
                              {behavior === 'stressful_events' && 'אירועים מלחיצים'}
                              {behavior === 'medications_taken' && 'נטילת תרופות'}
                            </Typography>
                            <Typography 
                              variant="h5"
                              color={
                                (behavior === 'self_harm' || behavior === 'suicidal_thoughts') && count > 0
                                  ? 'error'
                                  : 'inherit'
                              }
                            >
                              {percentage.toFixed(1)}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ({count} מתוך {values.length} ימים)
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );

  if (loading && !patientsSummary.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        דשבורד מטפל
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            סקירת מטופלים
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>שם המטופל</TableCell>
                  <TableCell>כניסה אחרונה</TableCell>
                  <TableCell>רשומות בשבוע האחרון</TableCell>
                  <TableCell>גורמי סיכון</TableCell>
                  <TableCell>פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patientsSummary.map((patient) => (
                  <TableRow
                    key={patient.patient_id}
                    sx={{
                      backgroundColor: patient.needs_attention ? 'rgba(255, 0, 0, 0.05)' : 'inherit',
                    }}
                  >
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>
                      {patient.last_entry_date
                        ? format(new Date(patient.last_entry_date), 'd/M/yyyy')
                        : 'אין רשומות'}
                    </TableCell>
                    <TableCell>{patient.entries_last_week}</TableCell>
                    <TableCell>
                      {patient.risk_factors.map((factor) => (
                        <Chip
                          key={factor}
                          label={factor}
                          color="error"
                          size="small"
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          setSelectedPatient(patient);
                          fetchPatientDetails(patient.patient_id);
                        }}
                      >
                        צפה בפרטים
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {renderPatientDialog()}
    </Box>
  );
};

export default TherapistDashboard;

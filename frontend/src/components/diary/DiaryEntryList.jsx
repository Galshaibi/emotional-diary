import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Alert,
  Chip,
  Tooltip,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  useTheme,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  SentimentVerySatisfied,
  SentimentSatisfied,
  SentimentNeutral,
  SentimentDissatisfied,
  SentimentVeryDissatisfied,
  MoodBad,
  Warning as WarningIcon,
  LocalHospital as MedicationIcon,
  Psychology as TherapyIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const emotionIcons = {
  'very_happy': <SentimentVerySatisfied color="primary" />,
  'happy': <SentimentSatisfied color="primary" />,
  'neutral': <SentimentNeutral color="action" />,
  'sad': <SentimentDissatisfied color="warning" />,
  'very_sad': <SentimentVeryDissatisfied color="error" />,
  'angry': <MoodBad color="error" />,
};

const emotionLabels = {
  'very_happy': 'מאוד שמח',
  'happy': 'שמח',
  'neutral': 'נייטרלי',
  'sad': 'עצוב',
  'very_sad': 'מאוד עצוב',
  'angry': 'כועס',
};

const behaviorIcons = {
  'self_harm': <WarningIcon color="error" />,
  'medications_taken': <MedicationIcon color="primary" />,
  'therapy_session': <TherapyIcon color="secondary" />,
  'stressful_events': <EventIcon color="warning" />,
};

const behaviorLabels = {
  'self_harm': 'פגיעה עצמית',
  'medications_taken': 'נטילת תרופות',
  'therapy_session': 'טיפול',
  'stressful_events': 'אירועים מלחיצים',
  'suicidal_thoughts': 'מחשבות אובדניות',
};

const DiaryEntryList = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/diary/entries`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEntries(response.data);
      setError('');
    } catch (err) {
      setError('שגיאה בטעינת הרשומות');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewEntry = (entry) => {
    setSelectedEntry(entry);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleNewEntry = () => {
    navigate('/diary/new');
  };

  const handleDeleteEntry = async (entryId) => {
    if (window.confirm('האם את/ה בטוח/ה שברצונך למחוק רשומה זו?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `${API_URL}/diary/entries/${entryId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        fetchEntries();
      } catch (err) {
        setError('שגיאה במחיקת הרשומה');
      }
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography>טוען...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: 'primary.main'
          }}
        >
          רשומות יומן
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewEntry}
        >
          רשומה חדשה
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>תאריך</TableCell>
              <TableCell>רגש</TableCell>
              <TableCell>התנהגויות</TableCell>
              <TableCell>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((entry) => (
                <TableRow
                  key={entry.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <TableCell>
                    {format(new Date(entry.date), 'dd/MM/yyyy HH:mm', { locale: he })}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {emotionIcons[entry.emotion]}
                      <Typography>{emotionLabels[entry.emotion]}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {Object.entries(entry.behaviors).map(([behavior, value]) => (
                        value && (
                          <Tooltip
                            key={behavior}
                            title={behaviorLabels[behavior]}
                            placement="top"
                          >
                            <Chip
                              icon={behaviorIcons[behavior]}
                              label={behaviorLabels[behavior]}
                              size="small"
                              color={behavior === 'self_harm' ? 'error' : 'default'}
                              variant="outlined"
                            />
                          </Tooltip>
                        )
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="צפה">
                        <IconButton
                          onClick={() => handleViewEntry(entry)}
                          size="small"
                          color="primary"
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="מחק">
                        <IconButton
                          onClick={() => handleDeleteEntry(entry.id)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={entries.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="שורות בעמוד"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} מתוך ${count}`
          }
        />
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedEntry && (
          <>
            <DialogTitle>
              <Typography variant="h6">
                רשומה מתאריך {format(new Date(selectedEntry.date), 'dd/MM/yyyy HH:mm', { locale: he })}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  רגש
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {emotionIcons[selectedEntry.emotion]}
                  <Typography>{emotionLabels[selectedEntry.emotion]}</Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  התנהגויות
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {Object.entries(selectedEntry.behaviors).map(([behavior, value]) => (
                    value && (
                      <Chip
                        key={behavior}
                        icon={behaviorIcons[behavior]}
                        label={behaviorLabels[behavior]}
                        color={behavior === 'self_harm' ? 'error' : 'default'}
                        variant="outlined"
                      />
                    )
                  ))}
                </Box>
              </Box>

              {selectedEntry.notes && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    הערות
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedEntry.notes}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>סגור</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default DiaryEntryList;

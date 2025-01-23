import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PatientDashboard = () => {
  // נתונים לדוגמה - בהמשך נחליף אותם בנתונים אמיתיים מה-API
  const moodData = [
    { date: '1/1', mood: 7 },
    { date: '2/1', mood: 6 },
    { date: '3/1', mood: 8 },
    { date: '4/1', mood: 5 },
    { date: '5/1', mood: 9 },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="right">
        ברוך הבא ליומן הרגשי שלך
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom align="right">
              מעקב מצב רוח
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="mood" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom align="right">
              סיכום שבועי
            </Typography>
            <Typography align="right">
              השבוע הרגשת בממוצע טוב יותר מהשבוע שעבר.
              המצב רוח הטוב ביותר היה ביום חמישי.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom align="right">
              טיפים ליום הקרוב
            </Typography>
            <Typography align="right">
              • נסה לשלב פעילות גופנית קלה
              <br />
              • הקדש זמן למדיטציה או הרפיה
              <br />
              • שתף את התחושות שלך עם אדם קרוב
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatientDashboard;

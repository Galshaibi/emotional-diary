import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormGroup,
  FormControlLabel,
  Divider,
  Button,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    dailyReminder: true,
    reminderTime: '20:00',
    reminderFrequency: 'daily',
  });

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const handleSettingChange = (setting) => (event) => {
    setSettings({
      ...settings,
      [setting]: event.target.checked,
    });
  };

  const handleTimeChange = (event) => {
    setSettings({
      ...settings,
      reminderTime: event.target.value,
    });
  };

  const handleFrequencyChange = (event) => {
    setSettings({
      ...settings,
      reminderFrequency: event.target.value,
    });
  };

  const handleSave = () => {
    // TODO: Implement API call to save settings
    setShowSaveSuccess(true);
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        הגדרות התראות
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ערוצי התראות
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={handleSettingChange('emailNotifications')}
                />
              }
              label="התראות באימייל"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.pushNotifications}
                  onChange={handleSettingChange('pushNotifications')}
                />
              }
              label="התראות בדפדפן"
            />
          </FormGroup>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            תזכורות יומן
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.dailyReminder}
                  onChange={handleSettingChange('dailyReminder')}
                />
              }
              label="תזכורות למילוי יומן"
            />
            {settings.dailyReminder && (
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>תדירות תזכורות</InputLabel>
                  <Select
                    value={settings.reminderFrequency}
                    onChange={handleFrequencyChange}
                    label="תדירות תזכורות"
                  >
                    <MenuItem value="daily">יומי</MenuItem>
                    <MenuItem value="weekly">שבועי</MenuItem>
                    <MenuItem value="custom">מותאם אישית</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>שעת תזכורת</InputLabel>
                  <Select
                    value={settings.reminderTime}
                    onChange={handleTimeChange}
                    label="שעת תזכורת"
                  >
                    <MenuItem value="08:00">08:00</MenuItem>
                    <MenuItem value="12:00">12:00</MenuItem>
                    <MenuItem value="16:00">16:00</MenuItem>
                    <MenuItem value="20:00">20:00</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </FormGroup>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              size="large"
            >
              שמור שינויים
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={showSaveSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSaveSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSaveSuccess(false)}
          severity="success"
          variant="filled"
        >
          ההגדרות נשמרו בהצלחה
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationSettings;

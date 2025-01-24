import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Layout from './components/layout/Layout';
import DiaryEntryForm from './components/diary/DiaryEntryForm';
import DiaryEntryList from './components/diary/DiaryEntryList';
import PatientDashboard from './components/dashboard/PatientDashboard';
import TherapistDashboard from './components/dashboard/TherapistDashboard';
import NotificationSettings from './components/notifications/NotificationSettings';
import NotificationCenter from './components/notifications/NotificationCenter';

// Create RTL cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Create theme
const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: [
      'Rubik',
      'Assistant',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff4081',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/app/dashboard/patient" />} />
            <Route
              path="/app/*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/diary/new" element={<DiaryEntryForm />} />
                    <Route path="/diary" element={<DiaryEntryList />} />
                    <Route path="/dashboard/patient" element={<PatientDashboard />} />
                    <Route path="/dashboard/therapist" element={<TherapistDashboard />} />
                    <Route path="/notifications/settings" element={<NotificationSettings />} />
                    <Route path="/notifications" element={<NotificationCenter />} />
                    <Route path="/" element={<Navigate to="/dashboard/patient" />} />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DiaryEntryList = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/diary/entries`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setEntries(response.data);
      } catch (error) {
        console.error('Error fetching diary entries:', error);
      }
    };

    fetchEntries();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/diary/new')}
        >
          רשומה חדשה
        </Button>
        <Typography variant="h5" component="h1">
          היסטוריית רשומות
        </Typography>
      </Box>

      <Paper>
        <List>
          {entries.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="אין רשומות עדיין"
                secondary="לחץ על 'רשומה חדשה' כדי להתחיל"
                primaryTypographyProps={{ align: 'right' }}
                secondaryTypographyProps={{ align: 'right' }}
              />
            </ListItem>
          ) : (
            entries.map((entry, index) => (
              <React.Fragment key={entry.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={formatDate(entry.created_at)}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary" align="right">
                          מצב רוח: {entry.mood}/10
                        </Typography>
                        <Typography variant="body2" align="right">
                          {entry.content}
                        </Typography>
                        {entry.activities && (
                          <Typography variant="body2" align="right">
                            פעילויות: {entry.activities}
                          </Typography>
                        )}
                        {entry.thoughts && (
                          <Typography variant="body2" align="right">
                            תובנות: {entry.thoughts}
                          </Typography>
                        )}
                      </>
                    }
                    primaryTypographyProps={{ align: 'right' }}
                  />
                </ListItem>
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default DiaryEntryList;

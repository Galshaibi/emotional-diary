import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Slider, Paper, Chip, Autocomplete } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const emotions = [
  'שמחה',
  'עצב',
  'כעס',
  'פחד',
  'חרדה',
  'תקווה',
  'אכזבה',
  'גאווה',
  'בושה',
  'אשמה',
  'בדידות',
  'אהבה',
  'שלווה',
  'תסכול',
  'התרגשות',
  'דאגה',
  'הקלה',
  'בלבול'
];

const DiaryEntryForm = () => {
  const navigate = useNavigate();
  const [entry, setEntry] = useState({
    mood: 5,
    content: '',
    activities: '',
    thoughts: '',
    emotions: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/diary/entries`,
        entry,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      navigate('/diary');
    } catch (error) {
      console.error('Error creating diary entry:', error);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" component="h1" gutterBottom align="right">
        רשומה חדשה ביומן
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom align="right">
            איך אתה מרגיש היום? (1-10)
          </Typography>
          <Slider
            value={entry.mood}
            onChange={(_, value) => setEntry({ ...entry, mood: value })}
            min={1}
            max={10}
            marks
            valueLabelDisplay="auto"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom align="right">
            אילו רגשות חווית היום?
          </Typography>
          <Autocomplete
            multiple
            options={emotions}
            value={entry.emotions}
            onChange={(_, newValue) => setEntry({ ...entry, emotions: newValue })}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="בחר רגשות"
                InputProps={{
                  ...params.InputProps,
                  style: { textAlign: 'right' }
                }}
              />
            )}
          />
        </Box>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="מה עבר עליך היום?"
          value={entry.content}
          onChange={(e) => setEntry({ ...entry, content: e.target.value })}
          sx={{ mb: 2 }}
          InputProps={{
            style: { textAlign: 'right' }
          }}
        />

        <TextField
          fullWidth
          label="אילו פעילויות עשית היום?"
          value={entry.activities}
          onChange={(e) => setEntry({ ...entry, activities: e.target.value })}
          sx={{ mb: 2 }}
          InputProps={{
            style: { textAlign: 'right' }
          }}
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          label="מחשבות ותובנות"
          value={entry.thoughts}
          onChange={(e) => setEntry({ ...entry, thoughts: e.target.value })}
          sx={{ mb: 3 }}
          InputProps={{
            style: { textAlign: 'right' }
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="button"
            onClick={() => navigate('/diary')}
            sx={{ ml: 2 }}
          >
            ביטול
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
          >
            שמור רשומה
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default DiaryEntryForm;

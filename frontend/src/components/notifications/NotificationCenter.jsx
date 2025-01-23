import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Card,
  Divider,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const NotificationCenter = () => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'תזכורת ליומן',
      message: 'לא מילאת את היומן הרגשי היום',
      type: 'reminder',
      timestamp: '2024-01-20T10:00:00',
      read: false,
    },
    {
      id: 2,
      title: 'עדכון מהמטפל',
      message: 'המטפל שלך הגיב על הרשומה האחרונה שלך',
      type: 'update',
      timestamp: '2024-01-19T15:30:00',
      read: true,
    },
  ]);

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL', {
      day: 'numeric',
      month: 'long',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        התראות
      </Typography>

      <Card sx={{ p: 0 }}>
        <List>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body1" align="center">
                    אין התראות חדשות
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    backgroundColor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                    transition: 'background-color 0.3s',
                  }}
                  secondaryAction={
                    <Box>
                      {!notification.read && (
                        <IconButton
                          edge="end"
                          aria-label="mark as read"
                          onClick={() => handleMarkAsRead(notification.id)}
                          sx={{ mr: 1 }}
                        >
                          <CheckIcon />
                        </IconButton>
                      )}
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDelete(notification.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    <NotificationsIcon
                      color={notification.read ? 'disabled' : 'primary'}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="subtitle1"
                          component="span"
                          sx={{ fontWeight: notification.read ? 400 : 600 }}
                        >
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.type === 'reminder' ? 'תזכורת' : 'עדכון'}
                          size="small"
                          color={notification.type === 'reminder' ? 'primary' : 'secondary'}
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ mb: 1, mt: 0.5 }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(notification.timestamp)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))
          )}
        </List>
      </Card>
    </Box>
  );
};

export default NotificationCenter;

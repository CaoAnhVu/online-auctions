import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Paper, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Button, Divider, Tabs, Tab, Switch, FormControlLabel, Alert } from '@mui/material';
import { Delete as DeleteIcon, Check as CheckIcon } from '@mui/icons-material';
import { getNotifications, markAsRead, deleteNotification, updateNotificationPreference } from '../redux/slices/notificationSlice';

function TabPanel({ children, value, index }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ p: 3 }}>{children}</Box>}</div>;
}

function NotificationsPage() {
  const dispatch = useDispatch();
  const { notifications, loading, error } = useSelector((state) => state.notification);
  const [tabValue, setTabValue] = useState(0);
  const [preferences, setPreferences] = useState({
    email: true,
    inApp: true,
    push: true,
  });

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleDelete = (id) => {
    dispatch(deleteNotification(id));
  };

  const handlePreferenceChange = (type) => (event) => {
    const newPreference = { ...preferences, [type]: event.target.checked };
    setPreferences(newPreference);
    dispatch(updateNotificationPreference({ type, ...newPreference }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Notifications
        </Typography>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="All Notifications" />
          <Tab label="Unread" />
          <Tab label="Preferences" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <List>
            {notifications?.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {notification.message}
                        </Typography>
                        <br />
                        {new Date(notification.createdAt).toLocaleString()}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    {!notification.read && (
                      <IconButton edge="end" onClick={() => handleMarkAsRead(notification.id)}>
                        <CheckIcon />
                      </IconButton>
                    )}
                    <IconButton edge="end" onClick={() => handleDelete(notification.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <List>
            {notifications
              ?.filter((notification) => !notification.read)
              .map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem>
                    <ListItemText
                      primary={notification.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {notification.message}
                          </Typography>
                          <br />
                          {new Date(notification.createdAt).toLocaleString()}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleMarkAsRead(notification.id)}>
                        <CheckIcon />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDelete(notification.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Notification Preferences
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel control={<Switch checked={preferences.email} onChange={handlePreferenceChange('email')} />} label="Email Notifications" />
            <FormControlLabel control={<Switch checked={preferences.inApp} onChange={handlePreferenceChange('inApp')} />} label="In-App Notifications" />
            <FormControlLabel control={<Switch checked={preferences.push} onChange={handlePreferenceChange('push')} />} label="Push Notifications" />
          </Box>
        </TabPanel>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
    </Container>
  );
}

export default NotificationsPage;

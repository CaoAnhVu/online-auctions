import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Paper, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Divider, Tabs, Tab, Switch, FormControlLabel, Alert, Tooltip } from '@mui/material';
import { Delete as DeleteIcon, Check as CheckIcon, DoneAll as DoneAllIcon } from '@mui/icons-material';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, updateNotificationPreference, clearNewStatus } from '../redux/slices/notificationSlice';

function TabPanel({ children, value, index }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ p: 3 }}>{children}</Box>}</div>;
}

function NotificationsPage() {
  const dispatch = useDispatch();
  const { notifications, error } = useSelector((state) => state.notification);
  const [tabValue, setTabValue] = useState(0);
  const [preferences, setPreferences] = useState({
    email: true,
    inApp: true,
    push: true,
  });

  useEffect(() => {
    dispatch(getNotifications());

    // Xóa trạng thái mới khi vào trang thông báo
    dispatch(clearNewStatus());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id))
      .unwrap()
      .then(() => {
        // Sau khi đánh dấu đã đọc thành công, cập nhật lại danh sách thông báo
        dispatch(getNotifications());
      })
      .catch((error) => {
        console.error('Failed to mark notification as read:', error);
      });
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead())
      .unwrap()
      .then(() => {
        // Sau khi đánh dấu tất cả đã đọc thành công, cập nhật lại danh sách thông báo
        dispatch(getNotifications());
      })
      .catch((error) => {
        console.error('Failed to mark all notifications as read:', error);
      });
  };

  const handleDelete = (id) => {
    dispatch(deleteNotification(id))
      .unwrap()
      .then(() => {
        // Sau khi xóa thông báo thành công, cập nhật lại danh sách thông báo
        dispatch(getNotifications());
      })
      .catch((error) => {
        console.error('Failed to delete notification:', error);
      });
  };

  const handlePreferenceChange = (type) => (event) => {
    const newPreference = { ...preferences, [type]: event.target.checked };
    setPreferences(newPreference);
    dispatch(updateNotificationPreference({ type, ...newPreference }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Notifications</Typography>
          {notifications?.length > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <DoneAllIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="All Notifications" />
          <Tab label="Unread" />
          <Tab label="Preferences" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {notifications?.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center" py={4}>
              No notifications yet
            </Typography>
          ) : (
            <List>
              {notifications?.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      bgcolor: index === 0 && notification.isNew ? 'rgba(25, 118, 210, 0.12)' : 'transparent',
                      transition: 'background-color 0.3s',
                    }}
                  >
                    <ListItemText
                      primary={notification.title || 'Notification'}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {notification.message}
                          </Typography>
                          <br />
                          {new Date(notification.createdAt).toLocaleString()}
                        </>
                      }
                      primaryTypographyProps={{ fontWeight: notification.read ? 'normal' : 'bold' }}
                    />
                    <ListItemSecondaryAction>
                      {!notification.read && (
                        <Tooltip title="Mark as read">
                          <IconButton edge="end" onClick={() => handleMarkAsRead(notification.id)}>
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton edge="end" onClick={() => handleDelete(notification.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {!notifications?.some((n) => !n.read) ? (
            <Typography variant="body1" color="text.secondary" align="center" py={4}>
              No unread notifications
            </Typography>
          ) : (
            <List>
              {notifications
                ?.filter((notification) => !notification.read)
                .map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      sx={{
                        bgcolor: index === 0 && notification.isNew ? 'rgba(25, 118, 210, 0.12)' : 'transparent',
                        transition: 'background-color 0.3s',
                      }}
                    >
                      <ListItemText
                        primary={notification.title || 'Notification'}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {notification.message}
                            </Typography>
                            <br />
                            {new Date(notification.createdAt).toLocaleString()}
                          </>
                        }
                        primaryTypographyProps={{ fontWeight: 'bold' }}
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Mark as read">
                          <IconButton edge="end" onClick={() => handleMarkAsRead(notification.id)}>
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton edge="end" onClick={() => handleDelete(notification.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
            </List>
          )}
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

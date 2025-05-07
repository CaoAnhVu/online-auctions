import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { getNotificationTemplates, createTemplate, updateTemplate, deleteTemplate } from '../../redux/slices/notificationTemplateSlice';

function NotificationTemplatesPage() {
  const dispatch = useDispatch();
  const { templates, loading, error } = useSelector((state) => state.notificationTemplate);
  const [open, setOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    content: '',
    variables: '',
  });

  useEffect(() => {
    dispatch(getNotificationTemplates());
  }, [dispatch]);

  const handleOpen = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        type: template.type,
        title: template.title,
        content: template.content,
        variables: Array.isArray(template.variables) ? template.variables.join(', ') : '',
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        type: '',
        title: '',
        content: '',
        variables: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTemplate(null);
    setFormData({
      type: '',
      title: '',
      content: '',
      variables: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const templateData = {
      ...formData,
      variables: formData.variables.split(',').map((v) => v.trim()),
    };

    if (editingTemplate) {
      await dispatch(updateTemplate({ id: editingTemplate.id, template: templateData }));
    } else {
      await dispatch(createTemplate(templateData));
    }

    handleClose();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      await dispatch(deleteTemplate(id));
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Notification Templates</Typography>
          <Button variant="contained" color="primary" onClick={() => handleOpen()}>
            Add Template
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Content</TableCell>
                <TableCell>Variables</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates?.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>{template.type}</TableCell>
                  <TableCell>{template.title}</TableCell>
                  <TableCell>{template.content}</TableCell>
                  <TableCell>{Array.isArray(template.variables) ? template.variables.join(', ') : ''}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(template)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(template.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>{editingTemplate ? 'Edit Template' : 'Add Template'}</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField fullWidth label="Type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} margin="normal" required />
              <TextField fullWidth label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} margin="normal" required />
              <TextField fullWidth label="Content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} margin="normal" multiline rows={4} required />
              <TextField
                fullWidth
                label="Variables (comma-separated)"
                value={formData.variables}
                onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                margin="normal"
                helperText="Example: userName, auctionTitle, bidAmount"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editingTemplate ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
}

export default NotificationTemplatesPage;

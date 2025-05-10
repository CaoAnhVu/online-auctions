import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Paper, Typography, TextField, Button, Grid, Box, CircularProgress, Alert, MenuItem, FormControl, InputLabel, Select, IconButton, Tooltip } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { fetchAuctionById, updateAuction } from '../redux/slices/auctionSlice';
import ImageUpload from '../components/ImageUpload';
import { format } from 'date-fns';

const categories = ['ELECTRONICS', 'FASHION', 'HOME', 'SPORTS', 'VEHICLES', 'COLLECTIBLES', 'ART', 'BOOKS', 'TOYS', 'MUSIC', 'OTHER'];
const conditions = ['NEW', 'LIKE_NEW', 'USED', 'REFURBISHED', 'FOR_PARTS'];
const API_BASE_URL = 'http://localhost:8080';

function parseDateTime(dt) {
  if (!dt) return null;
  if (Array.isArray(dt) && dt.length >= 5) {
    // Tháng trong JS là 0-based
    return new Date(dt[0], dt[1] - 1, dt[2], dt[3], dt[4], dt[5] || 0);
  }
  const d = new Date(dt);
  return isNaN(d) ? null : d;
}

function EditAuctionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentAuction, loading, error } = useSelector((state) => state.auction);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startingPrice: '',
    minimumBidIncrement: '',
    category: '',
    condition: '',
    endTime: '',
    images: [],
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    dispatch(fetchAuctionById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (currentAuction) {
      // Map category/condition về đúng value FE nếu backend trả về dạng khác
      let category = currentAuction.category || '';
      let condition = currentAuction.condition || '';
      if (categories.includes(category)) {
        // ok
      } else if (category && categories.map((c) => c.toUpperCase()).includes(category)) {
        category = categories.find((c) => c.toUpperCase() === category);
      }
      if (conditions.includes(condition)) {
        // ok
      } else if (condition && conditions.map((c) => c.toUpperCase()).includes(condition)) {
        condition = conditions.find((c) => c.toUpperCase() === condition);
      }
      setFormData({
        title: currentAuction.title || '',
        description: currentAuction.description || '',
        startingPrice: currentAuction.startingPrice || '',
        minimumBidIncrement: currentAuction.minimumBidIncrement || '',
        category,
        condition,
        endTime: currentAuction.endTime ? format(parseDateTime(currentAuction.endTime), "yyyy-MM-dd'T'HH:mm") : '',
        images: (currentAuction.images || []).map((img) => ({
          url: img.imageUrl && !img.imageUrl.startsWith('http') ? API_BASE_URL + img.imageUrl : img.imageUrl,
          id: img.id,
          name: img.imageUrl ? img.imageUrl.split('/').pop() : '',
        })),
      });

      setImagePreviews(
        (currentAuction.images || []).map((img) => ({
          url: img.imageUrl,
          name: img.imageUrl.split('/').pop(),
          id: img.id,
        }))
      );
    }
  }, [currentAuction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleImageChange = (images) => {
    setFormData((prev) => ({
      ...prev,
      images,
    }));
  };

  const validateForm = () => {
    const errors = {};
    const now = new Date();
    const endTime = new Date(formData.endTime);

    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.startingPrice) errors.startingPrice = 'Starting price is required';
    if (formData.startingPrice <= 0) errors.startingPrice = 'Starting price must be greater than 0';
    if (!formData.minimumBidIncrement) errors.minimumBidIncrement = 'Minimum bid increment is required';
    if (formData.minimumBidIncrement <= 0) errors.minimumBidIncrement = 'Minimum bid increment must be greater than 0';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.condition) errors.condition = 'Condition is required';
    if (!formData.endTime) errors.endTime = 'End time is required';
    if (endTime <= now) errors.endTime = 'End time must be in the future';
    if (formData.images.length === 0) errors.images = 'At least one image is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await dispatch(updateAuction({ id, auctionData: formData })).unwrap();
      navigate(`/auctions/${id}`);
    } catch (error) {
      console.error('Failed to update auction:', error);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Auction
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField fullWidth label="Title" name="title" value={formData.title} onChange={handleChange} error={!!validationErrors.title} helperText={validationErrors.title} required />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!validationErrors.description}
                helperText={validationErrors.description}
                multiline
                rows={4}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Starting Price (VND)"
                name="startingPrice"
                type="number"
                value={formData.startingPrice}
                onChange={handleChange}
                error={!!validationErrors.startingPrice}
                helperText={validationErrors.startingPrice}
                required
                inputProps={{ min: 0, step: 1000 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Bid Increment (VND)"
                name="minimumBidIncrement"
                type="number"
                value={formData.minimumBidIncrement}
                onChange={handleChange}
                error={!!validationErrors.minimumBidIncrement}
                helperText={validationErrors.minimumBidIncrement}
                required
                inputProps={{ min: 0, step: 1000 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!validationErrors.category}>
                <InputLabel>Category</InputLabel>
                <Select name="category" value={formData.category} onChange={handleChange} label="Category" required>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.category && (
                  <Typography color="error" variant="caption">
                    {validationErrors.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!validationErrors.condition}>
                <InputLabel>Condition</InputLabel>
                <Select name="condition" value={formData.condition} onChange={handleChange} label="Condition" required>
                  {conditions.map((condition) => (
                    <MenuItem key={condition} value={condition}>
                      {condition}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.condition && (
                  <Typography color="error" variant="caption">
                    {validationErrors.condition}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="End Time"
                name="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={handleChange}
                error={!!validationErrors.endTime}
                helperText={validationErrors.endTime}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Images
              </Typography>
              {validationErrors.images && (
                <Typography color="error" variant="caption" display="block" gutterBottom>
                  {validationErrors.images}
                </Typography>
              )}
              <ImageUpload images={formData.images} onImagesChange={handleImageChange} onRemove={handleRemoveImage} />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="outlined" onClick={() => navigate(`/auctions/${id}`)}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Update Auction'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default EditAuctionPage;

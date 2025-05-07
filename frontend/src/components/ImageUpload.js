import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, IconButton, Paper, Stack } from '@mui/material';
import { CloudUpload, Clear } from '@mui/icons-material';

function ImageUpload({ images, onImagesChange, maxFiles = 5 }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      const newImages = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      onImagesChange([...images, ...newImages].slice(0, maxFiles));
    },
    [images, onImagesChange, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxFiles: maxFiles - images.length,
    disabled: images.length >= maxFiles,
  });

  const removeImage = (index) => {
    const newImages = [...images];
    if (newImages[index].preview) {
      URL.revokeObjectURL(newImages[index].preview);
    }
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  return (
    <Box>
      <Paper
        {...getRootProps()}
        sx={{
          p: 2,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: images.length >= maxFiles ? 'not-allowed' : 'pointer',
          textAlign: 'center',
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        <Typography>{images.length >= maxFiles ? `Maximum ${maxFiles} images allowed` : `Drag & drop images here, or click to select (${images.length}/${maxFiles})`}</Typography>
      </Paper>

      {images.length > 0 && (
        <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: 'wrap', gap: 2 }}>
          {images.map((file, index) => (
            <Box
              key={file.preview || file.url}
              sx={{
                position: 'relative',
                width: 100,
                height: 100,
              }}
            >
              <img
                src={file.preview || file.url}
                alt={`preview ${index}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
              <IconButton
                size="small"
                onClick={() => removeImage(index)}
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: 'error.light',
                    color: 'white',
                  },
                }}
              >
                <Clear />
              </IconButton>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default ImageUpload;

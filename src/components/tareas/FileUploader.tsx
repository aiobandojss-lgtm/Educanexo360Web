// src/components/tareas/FileUploader.tsx
import React, { useCallback } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Alert,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
} from "@mui/icons-material";

interface FileUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string;
  label?: string;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedTypes = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.zip",
  label = "Archivos adjuntos",
  disabled = false,
}) => {
  const [dragActive, setDragActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Manejar drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Validar archivos
  const validateFiles = (newFiles: FileList | File[]): File[] | null => {
    const fileArray = Array.from(newFiles);
    
    // Verificar cantidad máxima
    if (files.length + fileArray.length > maxFiles) {
      setError(`Solo puedes subir hasta ${maxFiles} archivos`);
      return null;
    }

    // Verificar tamaño de cada archivo
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const invalidFiles = fileArray.filter(file => file.size > maxSizeBytes);
    
    if (invalidFiles.length > 0) {
      setError(`Algunos archivos superan el tamaño máximo de ${maxSizeMB}MB`);
      return null;
    }

    setError(null);
    return fileArray;
  };

  // Manejar drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const validFiles = validateFiles(e.dataTransfer.files);
        if (validFiles) {
          onFilesChange([...files, ...validFiles]);
        }
      }
    },
    [files, disabled, onFilesChange]
  );

  // Manejar selección de archivos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    if (e.target.files && e.target.files.length > 0) {
      const validFiles = validateFiles(e.target.files);
      if (validFiles) {
        onFilesChange([...files, ...validFiles]);
      }
    }
  };

  // Eliminar archivo
  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
    setError(null);
  };

  // Click en zona de upload
  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label} {!disabled && `(máx. ${maxFiles} archivos, ${maxSizeMB}MB c/u)`}
      </Typography>

      {/* Zona de drop */}
      <Paper
        variant="outlined"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        sx={{
          p: 3,
          textAlign: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          borderStyle: "dashed",
          borderWidth: 2,
          borderColor: dragActive ? "primary.main" : "divider",
          backgroundColor: dragActive ? "action.hover" : "transparent",
          opacity: disabled ? 0.5 : 1,
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: disabled ? "divider" : "primary.main",
            backgroundColor: disabled ? "transparent" : "action.hover",
          },
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleChange}
          style={{ display: "none" }}
          disabled={disabled}
        />
        <UploadIcon sx={{ fontSize: 48, color: "action.active", mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {disabled
            ? "No se pueden adjuntar archivos"
            : "Arrastra archivos aquí o haz clic para seleccionar"}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Formatos aceptados: PDF, Word, Excel, PowerPoint, imágenes, ZIP
        </Typography>
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Lista de archivos */}
      {files.length > 0 && (
        <List sx={{ mt: 2 }}>
          {files.map((file, index) => (
            <ListItem
              key={index}
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                mb: 1,
              }}
            >
              <FileIcon sx={{ mr: 2, color: "action.active" }} />
              <ListItemText
                primary={file.name}
                secondary={formatFileSize(file.size)}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleRemoveFile(index)}
                  disabled={disabled}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default FileUploader;
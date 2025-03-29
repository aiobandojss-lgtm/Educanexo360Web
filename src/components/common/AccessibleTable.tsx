// src/components/common/AccessibleTable.tsx
import React from 'react';
import {
  Table,
  TableProps,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Box,
  Typography,
  CircularProgress,
  TableContainer,
  Pagination,
  Alert,
  TableSortLabel
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';

export interface Column {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  format?: (value: any) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  minWidth?: string | number;
}

export interface AccessibleTableProps extends Omit<TableProps, 'children'> {
  columns: Column[];
  data: any[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  title?: string;
  caption?: string;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    column: string;
    direction: 'asc' | 'desc';
    onSortChange: (column: string, direction: 'asc' | 'desc') => void;
  };
  onRowClick?: (row: any) => void;
  stickyHeader?: boolean;
  maxHeight?: string | number;
  getRowId?: (row: any) => string;
}

/**
 * Tabla accesible que soporta paginación, ordenación y estados de carga
 */
const AccessibleTable: React.FC<AccessibleTableProps> = ({
  columns,
  data,
  loading = false,
  error = null,
  emptyMessage = 'No hay datos disponibles',
  title,
  caption,
  pagination,
  sorting,
  onRowClick,
  stickyHeader = false,
  maxHeight,
  getRowId = (row) => row.id || row._id || Math.random().toString(),
  ...props
}) => {
  const tableId = React.useId();
  
  const handleSort = (columnId: string) => {
    if (!sorting) return;
    
    const isAsc = sorting.column === columnId && sorting.direction === 'asc';
    
    sorting.onSortChange(columnId, isAsc ? 'desc' : 'asc');
  };
  
  const renderTableContent = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
            <CircularProgress size={40} aria-label="Cargando datos" />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Cargando datos...
            </Typography>
          </TableCell>
        </TableRow>
      );
    }
    
    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} align="center" sx={{ py: 2 }}>
            <Alert severity="error">{error}</Alert>
          </TableCell>
        </TableRow>
      );
    }
    
    if (data.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
            <Typography color="text.secondary">{emptyMessage}</Typography>
          </TableCell>
        </TableRow>
      );
    }
    
    return data.map((row) => {
      const rowId = getRowId(row);
      return (
        <TableRow 
          key={rowId}
          hover={Boolean(onRowClick)}
          onClick={onRowClick ? () => onRowClick(row) : undefined}
          tabIndex={onRowClick ? 0 : -1}
          role={onRowClick ? 'button' : undefined}
          aria-label={onRowClick ? `Ver detalles de fila ${rowId}` : undefined}
          sx={{
            cursor: onRowClick ? 'pointer' : 'default',
            '&:focus-visible': onRowClick ? {
              outline: '2px solid #5DA9E9',
              outlineOffset: '-2px',
            } : undefined,
          }}
          onKeyDown={onRowClick ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onRowClick(row);
            }
          } : undefined}
        >
          {columns.map((column) => {
            const value = row[column.id];
            return (
              <TableCell key={column.id} align={column.align || 'left'}>
                {column.format ? column.format(value) : value}
              </TableCell>
            );
          })}
        </TableRow>
      );
    });
  };
  
  return (
    <Box>
      {title && (
        <Typography 
          variant="h4" 
          component="h2" 
          id={`${tableId}-title`}
          gutterBottom
        >
          {title}
        </Typography>
      )}
      
      <TableContainer 
        component={Paper} 
        elevation={0}
        sx={{ 
          maxHeight: maxHeight,
          borderRadius: 3,
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Table 
          {...props} 
          stickyHeader={stickyHeader}
          aria-labelledby={title ? `${tableId}-title` : undefined}
          aria-describedby={caption ? `${tableId}-caption` : undefined}
        >
          {caption && (
            <caption 
              id={`${tableId}-caption`}
              style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden'}}
            >
              {caption}
            </caption>
          )}
          
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ 
                    width: column.width, 
                    minWidth: column.minWidth,
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    backgroundColor: '#f8f9fa',
                  }}
                  sortDirection={sorting && sorting.column === column.id ? sorting.direction : false}
                >
                  {column.sortable && sorting ? (
                    <TableSortLabel
                      active={sorting.column === column.id}
                      direction={sorting.column === column.id ? sorting.direction : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                      {sorting.column === column.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {sorting.direction === 'desc' ? 'ordenado descendentemente' : 'ordenado ascendentemente'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {renderTableContent()}
          </TableBody>
        </Table>
      </TableContainer>
      
      {pagination && pagination.totalPages > 1 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            page={pagination.page}
            count={pagination.totalPages}
            onChange={(_, newPage) => pagination.onPageChange(newPage)}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
            aria-label="Navegación de páginas"
          />
        </Box>
      )}
    </Box>
  );
};

export default AccessibleTable;
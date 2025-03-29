// src/components/common/AccessibleComponents.ts
import AccessibleButton from './AccessibleButton';
import AccessibleTextField from './AccessibleTextField';
import AccessibleTable, { Column as TableColumn } from './AccessibleTable';

// Exportar todos los componentes accesibles
export {
  AccessibleButton,
  AccessibleTextField,
  AccessibleTable,
  type TableColumn
};

// Exportar interfaz por defecto para facilitar importaciones
export default {
  Button: AccessibleButton,
  TextField: AccessibleTextField,
  Table: AccessibleTable,
};
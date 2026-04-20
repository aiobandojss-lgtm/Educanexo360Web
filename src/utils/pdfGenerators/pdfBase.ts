import jsPDF from 'jspdf';

export interface DatosEncabezado {
  nombreColegio: string;
  ciudad?: string;
  titulo: string;
  colorPrimario: [number, number, number];
  generadoPor: string;
}

/**
 * Dibuja la banda de color superior con nombre del colegio, ciudad, título y fecha.
 * Devuelve la coordenada Y donde termina el encabezado (punto de partida del contenido).
 */
export const agregarEncabezado = (doc: jsPDF, datos: DatosEncabezado): number => {
  const { nombreColegio, ciudad, titulo, colorPrimario, generadoPor } = datos;
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
  doc.rect(0, 0, pageWidth, 33, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(nombreColegio, 15, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (ciudad) {
    doc.text(ciudad, 15, 20);
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, pageWidth - 15, 13, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const fecha = new Date().toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  doc.text(`Generado: ${fecha}`, pageWidth - 15, 20, { align: 'right' });
  doc.text(`Por: ${generadoPor}`, pageWidth - 15, 27, { align: 'right' });

  doc.setTextColor(0, 0, 0);
  return 42;
};

/**
 * Agrega línea separadora + texto de footer y número de página en TODAS las páginas.
 * Llamar siempre DESPUÉS de generar todo el contenido.
 */
export const agregarFooter = (doc: jsPDF, textoIzq: string): void => {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(200, 200, 200);
    doc.line(15, pageHeight - 16, pageWidth - 15, pageHeight - 16);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(textoIzq, 15, pageHeight - 10);
    doc.text(`${i} / ${pageCount}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }
};

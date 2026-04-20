import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import type { RespuestaHistorial } from '../../services/asistenciaInformesService';
import type { Escuela } from '../../services/escuelaService';
import type { ParamsHistorial } from '../../services/asistenciaInformesService';
import { agregarEncabezado, agregarFooter } from './pdfBase';

type EstadoKey = 'PRESENTE' | 'AUSENTE' | 'TARDANZA' | 'JUSTIFICADO' | 'PERMISO';

const ESTADO_COLORES: Record<EstadoKey, { fondo: [number, number, number]; texto: [number, number, number] }> = {
  PRESENTE:    { fondo: [209, 250, 229], texto: [6, 95, 70] },
  AUSENTE:     { fondo: [254, 226, 226], texto: [153, 27, 27] },
  TARDANZA:    { fondo: [254, 243, 199], texto: [146, 64, 14] },
  JUSTIFICADO: { fondo: [219, 234, 254], texto: [30, 64, 175] },
  PERMISO:     { fondo: [243, 244, 246], texto: [55, 65, 81] },
};

const ESTADO_LABELS: Record<EstadoKey, string> = {
  PRESENTE: 'Presente',
  AUSENTE: 'Ausente',
  TARDANZA: 'Tardanza',
  JUSTIFICADO: 'Justificado',
  PERMISO: 'Permiso',
};

const formatFecha = (iso: string): string =>
  iso.substring(0, 10).split('-').reverse().join('/');

export const generarPdfHistorial = (
  data: RespuestaHistorial,
  escuela: Escuela | null,
  generadoPor: string,
  params: ParamsHistorial
): void => {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = agregarEncabezado(doc, {
    nombreColegio: escuela?.nombre ?? 'Institución Educativa',
    ciudad: escuela?.direccion,
    titulo: 'Historial de Asistencia',
    colorPrimario: [5, 150, 105],
    generadoPor,
  });

  // Bloque datos del estudiante
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.estudiante.nombre} ${data.estudiante.apellidos}`, 15, y);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(
    `Período: ${formatFecha(params.desde)} — ${formatFecha(params.hasta)}`,
    15,
    y + 6
  );
  doc.setTextColor(0, 0, 0);
  y += 16;

  // 5 tarjetas de resumen en fila
  const metricas: { label: string; valor: string }[] = [
    { label: 'Clases', valor: String(data.resumen.clasesTotales) },
    { label: 'Presentes', valor: String(data.resumen.presentes) },
    { label: 'Ausentes', valor: String(data.resumen.ausentes) },
    { label: 'Tardanzas', valor: String(data.resumen.tardanzas) },
    { label: '% Asistencia', valor: `${data.resumen.porcentajeAsistencia.toFixed(1)}%` },
  ];
  const cardW = (pageWidth - 30) / 5;
  metricas.forEach((m, i) => {
    const x = 15 + i * cardW;
    doc.setFillColor(240, 253, 244);
    doc.rect(x, y, cardW - 2, 17, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text(m.valor, x + (cardW - 2) / 2, y + 8, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(m.label, x + (cardW - 2) / 2, y + 14, { align: 'center' });
  });
  doc.setTextColor(0, 0, 0);
  y += 23;

  // Tabla detalle
  autoTable(doc, {
    startY: y,
    head: [['Fecha', 'Día', 'Asignatura', 'Estado', 'Observaciones']],
    body: data.registros.map((r) => [
      formatFecha(r.fecha),
      r.diaSemana,
      r.asignatura?.nombre ?? '—',
      ESTADO_LABELS[r.estado as EstadoKey] ?? r.estado,
      r.justificacion || r.observaciones || '—',
    ]),
    headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: { 3: { halign: 'center' } },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.column.index === 3) {
        const estado = data.registros[hookData.row.index]?.estado as EstadoKey;
        const config = ESTADO_COLORES[estado];
        if (config) {
          hookData.cell.styles.fillColor = config.fondo;
          hookData.cell.styles.textColor = config.texto;
          hookData.cell.styles.fontStyle = 'bold';
        }
      }
    },
    margin: { left: 15, right: 15 },
  });

  agregarFooter(doc, `Generado por: ${generadoPor}`);

  const apellidos = data.estudiante.apellidos.toLowerCase().replace(/\s+/g, '-');
  const nombre = data.estudiante.nombre.toLowerCase().replace(/\s+/g, '-');
  const fechaHoy = new Date().toISOString().substring(0, 10).replace(/-/g, '');
  doc.save(`historial-${apellidos}-${nombre}-${fechaHoy}.pdf`);
};

import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import type { RespuestaRiesgo, ParamsRiesgo } from '../../services/asistenciaInformesService';
import type { Escuela } from '../../services/escuelaService';
import { agregarEncabezado, agregarFooter } from './pdfBase';

export const generarPdfRiesgo = (
  data: RespuestaRiesgo,
  escuela: Escuela | null,
  generadoPor: string,
  params: ParamsRiesgo,
  nombreCurso?: string
): void => {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = agregarEncabezado(doc, {
    nombreColegio: escuela?.nombre ?? 'Institución Educativa',
    ciudad: escuela?.direccion,
    titulo: 'Informe de Riesgo',
    colorPrimario: [239, 68, 68],
    generadoPor,
  });

  // Línea de parámetros de consulta
  const formatFecha = (iso?: string): string =>
    iso ? iso.substring(0, 10).split('-').reverse().join('/') : '';

  const partes: string[] = [`Umbral: ${params.umbral ?? 80}%`];
  if (params.desde && params.hasta) {
    partes.push(`Período: ${formatFecha(params.desde)} — ${formatFecha(params.hasta)}`);
  }
  partes.push(`Curso: ${nombreCurso ?? 'Todos'}`);

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(partes.join('  ·  '), 15, y);
  doc.setTextColor(0, 0, 0);
  y += 10;

  // 3 tarjetas de resumen
  const tarjetas: { label: string; valor: string; r: number; g: number; b: number }[] = [
    { label: 'Total en riesgo', valor: String(data.total), r: 239, g: 68, b: 68 },
    { label: 'Críticos (<70%)', valor: String(data.criticos), r: 153, g: 27, b: 27 },
    { label: `En alerta (<${params.umbral ?? 80}%)`, valor: String(data.alertas), r: 146, g: 64, b: 14 },
  ];
  const cardW = (pageWidth - 30) / 3;
  tarjetas.forEach((t, i) => {
    const x = 15 + i * cardW;
    doc.setFillColor(255, 245, 245);
    doc.rect(x, y, cardW - 4, 17, 'F');
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(t.r, t.g, t.b);
    doc.text(t.valor, x + (cardW - 4) / 2, y + 9, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(t.label, x + (cardW - 4) / 2, y + 14, { align: 'center' });
  });
  doc.setTextColor(0, 0, 0);
  y += 23;

  // Tabla de estudiantes
  autoTable(doc, {
    startY: y,
    head: [['Estudiante', 'Curso', 'Clases', 'Ausencias', 'Tardanzas', '% Asistencia', 'Nivel']],
    body: data.estudiantes.map((e) => [
      `${e.nombre} ${e.apellidos}`,
      `${e.curso.nombre} ${e.curso.grado}-${e.curso.grupo}`,
      String(e.clasesTotales),
      String(e.ausencias),
      String(e.tardanzas),
      `${e.porcentajeAsistencia.toFixed(1)}%`,
      e.nivelRiesgo,
    ]),
    headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' },
      6: { halign: 'center' },
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.column.index === 6) {
        const nivel = data.estudiantes[hookData.row.index]?.nivelRiesgo;
        if (nivel === 'CRITICO') {
          hookData.cell.styles.fillColor = [255, 245, 245];
          hookData.cell.styles.textColor = [153, 27, 27];
          hookData.cell.styles.fontStyle = 'bold';
        } else {
          hookData.cell.styles.textColor = [146, 64, 14];
          hookData.cell.styles.fontStyle = 'bold';
        }
      }
    },
    margin: { left: 15, right: 15 },
  });

  agregarFooter(doc, 'Confidencial — uso interno');

  const fechaHoy = new Date().toISOString().substring(0, 10).replace(/-/g, '');
  doc.save(`riesgo-asistencia-${fechaHoy}.pdf`);
};

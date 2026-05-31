import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import type { EstadisticaEstudiantePeriodo } from '../../services/asistenciaInformesService';
import type { Escuela } from '../../services/escuelaService';
import { agregarEncabezado, agregarFooter } from './pdfBase';

export interface DatosCierrePeriodo {
  estadisticas: EstadisticaEstudiantePeriodo[];
  nombreCurso: string;
  grado: string;
  grupo: string;
  nombrePeriodo: string;
}

interface InterpretacionCierrePdf {
  titulo: string;
  mensajes: string[];
  acciones: string[];
}

export const generarPdfCierrePeriodo = (
  datos: DatosCierrePeriodo,
  escuela: Escuela | null,
  generadoPor: string,
  interpretacion?: InterpretacionCierrePdf,
): void => {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = agregarEncabezado(doc, {
    nombreColegio: escuela?.nombre ?? 'Institución Educativa',
    ciudad: escuela?.direccion,
    titulo: 'Cierre de Período',
    colorPrimario: [13, 148, 136],
    generadoPor,
  });

  // Bloque info del curso
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `${datos.nombreCurso}${datos.grado ? ` — Grado ${datos.grado}` : ''}${datos.grupo ? `, Grupo ${datos.grupo}` : ''}`,
    15,
    y
  );
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Período: ${datos.nombrePeriodo}`, 15, y + 6);
  doc.setTextColor(0, 0, 0);
  y += 16;

  // Resumen del curso (4 tarjetas)
  const total     = datos.estadisticas.length;
  const clasesMax = datos.estadisticas.reduce((m, e) => Math.max(m, e.clasesTotales), 0);
  const promedio  = total > 0 ? datos.estadisticas.reduce((s, e) => s + e.porcentajeAsistencia, 0) / total : 0;
  const enRiesgo  = datos.estadisticas.filter((e) => e.porcentajeAsistencia < 80).length;
  const criticos  = datos.estadisticas.filter((e) => e.porcentajeAsistencia < 70).length;

  const resumen: { label: string; valor: string; rojo?: boolean }[] = [
    { label: 'Total estudiantes',   valor: String(total) },
    { label: 'Clases dictadas',     valor: String(clasesMax) },
    { label: 'Promedio asistencia', valor: `${promedio.toFixed(1)}%` },
    { label: 'En riesgo (<80%)',    valor: String(enRiesgo), rojo: enRiesgo > 0 },
  ];
  const cardW = (pageWidth - 30) / 4;
  resumen.forEach((r, i) => {
    const x = 15 + i * cardW;
    doc.setFillColor(r.rojo ? 255 : 240, r.rojo ? 245 : 253, r.rojo ? 245 : 250);
    doc.rect(x, y, cardW - 3, 17, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(r.rojo ? 153 : 13, r.rojo ? 27 : 148, r.rojo ? 27 : 136);
    doc.text(r.valor, x + (cardW - 3) / 2, y + 8, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(r.label, x + (cardW - 3) / 2, y + 14, { align: 'center' });
  });
  doc.setTextColor(0, 0, 0);
  y += 23;

  // Sección de diagnóstico
  if (interpretacion) {
    const isCritico = criticos > 0 || promedio < 75;
    const colorBorde: [number, number, number]  = isCritico ? [239, 68, 68]  : enRiesgo > 0 ? [245, 158, 11] : [5, 150, 105];
    const colorTitulo: [number, number, number] = isCritico ? [153, 27, 27]  : enRiesgo > 0 ? [146, 64, 14]  : [6, 95, 70];

    const sectionStartY = y;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorTitulo);
    doc.text(interpretacion.titulo, 21, y + 5);
    y += 9;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(50, 50, 50);
    interpretacion.mensajes.forEach((msg) => {
      const lines = doc.splitTextToSize(`• ${msg}`, pageWidth - 37);
      doc.text(lines, 21, y);
      y += (lines as string[]).length * 4.5 + 1;
    });

    if (interpretacion.acciones.length > 0) {
      y += 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(80, 80, 80);
      doc.text('ACCIONES RECOMENDADAS:', 21, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      interpretacion.acciones.forEach((acc, i) => {
        const lines = doc.splitTextToSize(`${i + 1}. ${acc}`, pageWidth - 37);
        doc.text(lines, 21, y);
        y += (lines as string[]).length * 4.5 + 1;
      });
    }
    y += 3;

    // Borde izquierdo
    doc.setDrawColor(...colorBorde);
    doc.setLineWidth(1.5);
    doc.line(16, sectionStartY, 16, y);

    y += 5;
    doc.setTextColor(0, 0, 0);
  }

  // Tabla por estudiante
  autoTable(doc, {
    startY: y,
    head: [['Nombre', 'Clases', 'Presentes', 'Ausentes', 'Tardanzas', 'Justificados', '% Asistencia']],
    body: datos.estadisticas.map((e) => [
      e.nombreEstudiante,
      String(e.clasesTotales),
      String(e.presentes),
      String(e.ausentes),
      String(e.tardanzas),
      String(e.justificados),
      `${e.porcentajeAsistencia.toFixed(1)}%`,
    ]),
    headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' },
      6: { halign: 'center' },
    },
    didParseCell: (hookData) => {
      if (hookData.section !== 'body' || hookData.column.index !== 6) return;
      const pct = datos.estadisticas[hookData.row.index]?.porcentajeAsistencia ?? 100;
      if (pct < 70) {
        hookData.cell.styles.fillColor = [255, 235, 235];
        hookData.cell.styles.textColor = [153, 27, 27];
        hookData.cell.styles.fontStyle = 'bold';
      } else if (pct < 80) {
        hookData.cell.styles.fillColor = [255, 251, 235];
        hookData.cell.styles.textColor = [146, 64, 14];
        hookData.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: 15, right: 15 },
  });

  agregarFooter(doc, 'Documento oficial de la institución');

  const cursoSlug   = datos.nombreCurso.toLowerCase().replace(/\s+/g, '-');
  const periodoSlug = datos.nombrePeriodo.toLowerCase().replace(/\s+/g, '-');
  doc.save(`cierre-periodo-${cursoSlug}-${periodoSlug}.pdf`);
};

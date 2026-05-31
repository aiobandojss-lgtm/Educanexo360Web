import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import type { RespuestaRiesgo, ParamsRiesgo, EstudianteRiesgo } from '../../services/asistenciaInformesService';
import type { Escuela } from '../../services/escuelaService';
import { agregarEncabezado, agregarFooter } from './pdfBase';

interface InterpretacionRiesgo {
  titulo: string;
  mensajes: string[];
  acciones: string[];
}

const faltasAlCritico = (est: EstudianteRiesgo): number =>
  Math.floor(est.clasesTotales * 0.30) - est.ausencias;

export const generarPdfRiesgo = (
  data: RespuestaRiesgo,
  escuela: Escuela | null,
  generadoPor: string,
  params: ParamsRiesgo,
  nombreCurso?: string,
  estudiantesFiltrados?: EstudianteRiesgo[],
  totalesFiltrados?: { total: number; criticos: number; alertas: number },
  interpretacion?: InterpretacionRiesgo,
): void => {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  const estudiantes = estudiantesFiltrados ?? data.estudiantes;
  const totales = totalesFiltrados ?? { total: data.total, criticos: data.criticos, alertas: data.alertas };

  let y = agregarEncabezado(doc, {
    nombreColegio: escuela?.nombre ?? 'Institución Educativa',
    ciudad: escuela?.direccion,
    titulo: 'Informe de Riesgo de Asistencia',
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

  // Tarjetas de resumen (con totales filtrados)
  const tarjetas: { label: string; valor: string; r: number; g: number; b: number }[] = [
    { label: 'Total en riesgo',             valor: String(totales.total),    r: 239, g: 68,  b: 68  },
    { label: 'Críticos (<70%)',             valor: String(totales.criticos), r: 153, g: 27,  b: 27  },
    { label: `En alerta (<${params.umbral ?? 80}%)`, valor: String(totales.alertas), r: 146, g: 64, b: 14 },
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

  // Sección de diagnóstico e interpretación
  if (interpretacion) {
    const isCritico = totales.criticos > 0;
    const colorBorde: [number, number, number] = isCritico ? [239, 68, 68]  : [245, 158, 11];
    const colorTitulo: [number, number, number] = isCritico ? [153, 27, 27] : [146, 64, 14];

    const sectionStartY = y;

    // Título de la sección
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorTitulo);
    doc.text(interpretacion.titulo, 21, y + 5);
    y += 9;

    // Mensajes
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(50, 50, 50);
    interpretacion.mensajes.forEach((msg) => {
      const lines = doc.splitTextToSize(`• ${msg}`, pageWidth - 37);
      doc.text(lines, 21, y);
      y += (lines as string[]).length * 4.5 + 1;
    });

    // Acciones recomendadas
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

    // Borde izquierdo (dibujado después de conocer la altura total)
    doc.setDrawColor(...colorBorde);
    doc.setLineWidth(1.5);
    doc.line(16, sectionStartY, 16, y);

    y += 5;
    doc.setTextColor(0, 0, 0);
  }

  // Tabla de estudiantes
  autoTable(doc, {
    startY: y,
    head: [['Estudiante', 'Curso', 'Clases', 'Ausencias', '% Asistencia', 'Faltas al 70%', 'Nivel']],
    body: estudiantes.map((e) => {
      const faltas = faltasAlCritico(e);
      const faltasLabel =
        faltas > 0 ? `+${faltas} restantes`
        : faltas === 0 ? 'En límite'
        : `${Math.abs(faltas)} excedidas`;
      return [
        `${e.nombre} ${e.apellidos}`,
        `${e.curso.nombre} ${e.curso.grado}-${e.curso.grupo}`,
        String(e.clasesTotales),
        String(e.ausencias),
        `${e.porcentajeAsistencia.toFixed(1)}%`,
        faltasLabel,
        e.nivelRiesgo,
      ];
    }),
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
      if (hookData.section !== 'body') return;
      const est = estudiantes[hookData.row.index];
      if (!est) return;
      if (hookData.column.index === 6) {
        if (est.nivelRiesgo === 'CRITICO') {
          hookData.cell.styles.fillColor = [255, 245, 245];
          hookData.cell.styles.textColor = [153, 27, 27];
          hookData.cell.styles.fontStyle = 'bold';
        } else {
          hookData.cell.styles.textColor = [146, 64, 14];
          hookData.cell.styles.fontStyle = 'bold';
        }
      }
      if (hookData.column.index === 5) {
        const faltas = faltasAlCritico(est);
        if (faltas <= 0) {
          hookData.cell.styles.textColor = [153, 27, 27];
          hookData.cell.styles.fontStyle = 'bold';
        } else if (faltas <= 3) {
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

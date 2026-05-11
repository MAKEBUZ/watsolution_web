import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');

export interface InvoicePdfData {
  invoiceId: number;
  personName: string;
  documentNumber?: string;
  subscriberNumber?: string;
  issueDate: Date;
  dueDate: Date;
  consumptionM3: number;
  ratePerM3: number;
  fixedCharge: number;
  subsidyPercent: number;
  additionalCharges: number;
  amountDue: number;
}

@Injectable()
export class InvoicePdfService {
  generate(data: InvoicePdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const blue = '#0077be';
      const gray = '#64748b';
      const light = '#f8fafc';

      // Header
      doc.rect(0, 0, doc.page.width, 80).fill(blue);
      doc.fillColor('white').fontSize(22).font('Helvetica-Bold').text('WatSolution', 50, 25);
      doc.fontSize(10).font('Helvetica').text('Sistema de Gestión de Agua', 50, 52);
      doc.fillColor('white').fontSize(14).font('Helvetica-Bold').text(`FACTURA FAC-${data.invoiceId}`, 0, 30, { align: 'right' });

      doc.moveDown(3);

      // Subscriber info
      doc.fillColor(gray).fontSize(9).font('Helvetica-Bold').text('SUSCRIPTOR', 50, 100);
      doc.fillColor('#2c3e50').fontSize(11).font('Helvetica-Bold').text(data.personName, 50, 114);
      if (data.documentNumber) doc.fillColor(gray).fontSize(9).font('Helvetica').text(`Doc: ${data.documentNumber}`, 50, 130);
      if (data.subscriberNumber) doc.fontSize(9).text(`Suscriptor: ${data.subscriberNumber}`, 50, 142);

      // Dates
      const fmt = (d: Date) =>
        new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
      doc.fillColor(gray).fontSize(9).font('Helvetica-Bold').text('FECHA EMISIÓN', 360, 100);
      doc.fillColor('#2c3e50').fontSize(10).font('Helvetica').text(fmt(data.issueDate), 360, 114);
      doc.fillColor(gray).fontSize(9).font('Helvetica-Bold').text('FECHA VENCIMIENTO', 360, 130);
      doc.fillColor('#991b1b').fontSize(10).font('Helvetica-Bold').text(fmt(data.dueDate), 360, 144);

      // Divider
      doc.moveTo(50, 170).lineTo(doc.page.width - 50, 170).strokeColor('#e2e8f0').stroke();

      // Detail table header
      doc.rect(50, 180, doc.page.width - 100, 22).fill(light);
      doc.fillColor(gray).fontSize(9).font('Helvetica-Bold');
      doc.text('CONCEPTO', 60, 187);
      doc.text('VALOR', doc.page.width - 150, 187, { width: 100, align: 'right' });

      const row = (label: string, value: string, y: number) => {
        doc.fillColor('#2c3e50').fontSize(10).font('Helvetica').text(label, 60, y);
        doc.text(value, doc.page.width - 150, y, { width: 100, align: 'right' });
      };

      const fmt$ = (n: number) => `$${Math.round(n).toLocaleString('es-CO')}`;
      let y = 212;
      row(`Consumo del periodo: ${data.consumptionM3} m³`, fmt$(data.consumptionM3 * data.ratePerM3), y);
      y += 20;
      row(`Tarifa por m³: ${fmt$(data.ratePerM3)}`, '', y);
      y += 20;
      row('Cargo fijo', fmt$(data.fixedCharge), y);

      const subtotal = data.consumptionM3 * data.ratePerM3 + data.fixedCharge;
      y += 28;
      doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor('#e2e8f0').stroke();
      y += 8;
      row('Subtotal', fmt$(subtotal), y);

      if (data.subsidyPercent > 0) {
        y += 20;
        doc.fillColor('#166534').fontSize(10).font('Helvetica').text(`Subsidio aplicado (${(data.subsidyPercent * 100).toFixed(0)}%)`, 60, y);
        doc.text(`- ${fmt$(subtotal * data.subsidyPercent)}`, doc.page.width - 150, y, { width: 100, align: 'right' });
      }

      if (data.additionalCharges > 0) {
        y += 20;
        doc.fillColor('#991b1b').fontSize(10).font('Helvetica').text('Recargos adicionales', 60, y);
        doc.text(`+ ${fmt$(data.additionalCharges)}`, doc.page.width - 150, y, { width: 100, align: 'right' });
      }

      // Total box
      y += 35;
      doc.rect(50, y, doc.page.width - 100, 40).fill(blue);
      doc.fillColor('white').fontSize(12).font('Helvetica-Bold').text('TOTAL A PAGAR', 60, y + 13);
      doc.fontSize(14).text(fmt$(data.amountDue), doc.page.width - 150, y + 11, { width: 100, align: 'right' });

      // Footer
      doc.fillColor(gray).fontSize(8).font('Helvetica').text('WatSolution · Sistema de Gestión de Agua', 50, doc.page.height - 40, { align: 'center' });

      doc.end();
    });
  }
}

import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface ReportColumn {
  header: string;
  key: string;
}

interface ExportPdfOptions {
  filename: string;
  pharmacyName?: string;
  title: string;
  subtitle?: string;
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  summaryLines?: string[];
}

const BRAND_BLUE: [number, number, number] = [37, 99, 235];

export function exportReportPdf({ filename, pharmacyName, title, subtitle, columns, rows, summaryLines }: ExportPdfOptions) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text(pharmacyName || "Pharmacy", 14, 16);

  doc.setFontSize(13);
  doc.text(title, 14, 25);

  let cursorY = 25;
  if (subtitle) {
    cursorY += 6;
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(subtitle, 14, cursorY);
  }

  if (summaryLines?.length) {
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    summaryLines.forEach((line) => {
      cursorY += 5;
      doc.text(line, 14, cursorY);
    });
  }

  const lastRowIndex = rows.length - 1;

  autoTable(doc, {
    startY: cursorY + 6,
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => String(row[c.key] ?? ""))),
    headStyles: { fillColor: BRAND_BLUE, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [239, 246, 255] },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      if (data.section === "body" && data.row.index === lastRowIndex) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [229, 231, 235];
      }
    },
  });

  doc.save(filename);
}

interface ExportExcelOptions {
  filename: string;
  sheetName: string;
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
}

export function exportReportExcel({ filename, sheetName, columns, rows }: ExportExcelOptions) {
  const data = rows.map((row) => {
    const flat: Record<string, unknown> = {};
    for (const col of columns) flat[col.header] = row[col.key] ?? "";
    return flat;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet["!cols"] = columns.map((c) => ({ wch: Math.max(c.header.length + 2, 14) }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, filename);
}

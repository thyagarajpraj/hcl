import { jsPDF } from "jspdf";
import Papa from "papaparse";

export function exportToCSV(
  data: Array<Record<string, string | number>>,
  filename: string
): void {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(
  title: string,
  columns: string[],
  rows: Array<Array<string | number>>,
  filename: string
): void {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;

  // Add title
  pdf.setFontSize(16);
  pdf.text(title, margin, margin);

  // Add table
  const startY = margin + 15;
  const columnWidth = (pageWidth - 2 * margin) / columns.length;

  // Headers
  pdf.setFontSize(11);
  pdf.setFont(undefined, "bold");
  columns.forEach((col, index) => {
    pdf.text(col, margin + index * columnWidth, startY);
  });

  // Rows
  pdf.setFont(undefined, "normal");
  rows.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const y = startY + 10 + rowIndex * 8;
      if (y > pageHeight - margin) {
        pdf.addPage();
      }
      pdf.text(String(cell), margin + colIndex * columnWidth, y);
    });
  });

  pdf.save(`${filename}.pdf`);
}

export function exportFeedbackToCSV(
  feedback: Array<{
    givenBy?: { name: string };
    givenTo?: { name: string };
    rating: number;
    comment: string;
    createdAt: string;
  }>,
  filename: string = "feedback"
): void {
  const data = feedback.map(fb => ({
    "From": fb.givenBy?.name || "Unknown",
    "To": fb.givenTo?.name || "Unknown",
    "Rating": fb.rating,
    "Comment": fb.comment,
    "Date": new Date(fb.createdAt).toLocaleDateString()
  }));

  exportToCSV(data, filename);
}

export function exportFeedbackToPDF(
  feedback: Array<{
    givenBy?: { name: string };
    givenTo?: { name: string };
    rating: number;
    comment: string;
    createdAt: string;
  }>,
  filename: string = "feedback"
): void {
  const columns = ["From", "To", "Rating", "Comment", "Date"];
  const rows = feedback.map(fb => [
    fb.givenBy?.name || "Unknown",
    fb.givenTo?.name || "Unknown",
    String(fb.rating),
    fb.comment.substring(0, 50) + (fb.comment.length > 50 ? "..." : ""),
    new Date(fb.createdAt).toLocaleDateString()
  ]);

  exportToPDF("Employee Feedback Report", columns, rows, filename);
}

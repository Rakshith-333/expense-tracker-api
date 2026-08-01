import Expense from "../models/expense.model.js";
import mongoose from "mongoose";

const escapeCsvValue = (value) => {
  const stringValue = String(value ?? "");
  return `"${stringValue.replace(/"/g, '""')}"`;
};

const buildCsv = (expenses) => {
  const header = [
    "Date",
    "Description",
    "Category",
    "Amount",
    "Payment Mode",
    "Notes",
  ];

  const rows = expenses.map((expense) => [
    new Date(expense.expenseDate).toISOString(),
    expense.description ?? "",
    expense.category,
    expense.amount,
    expense.paymentMode,
    expense.notes ?? "",
  ]);

  return [header, ...rows]
    .map((line) => line.map((value) => escapeCsvValue(value)).join(","))
    .join("\r\n");
};

const buildPdf = (expenses) => {
  const lines = expenses.map((expense, index) => {
    const date = new Date(expense.expenseDate).toLocaleString();
    return `BT /F1 12 Tf 50 ${760 - index * 16} Td (${date} | ${expense.category} | ${expense.description ?? ""} | ₹${expense.amount}) Tj ET`;
  });

  return `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${lines.length * 80 + 120} >>
stream
BT
/F1 14 Tf
50 760 Td
(Expense Tracker Report) Tj
0 -20 Td
${lines.join("\n")}
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000063 00000 n 
0000000122 00000 n 
0000000248 00000 n 
0000000450 00000 n 
trailer
<< /Root 1 0 R /Size 6 >>
startxref
${lines.length * 80 + 540}
%%EOF`;
};

const getReportExport = async (userId, format = "csv") => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const expenses = await Expense.find({ userId: userObjectId }).sort({ expenseDate: -1 }).lean();

  if (format === "pdf") {
    return {
      contentType: "application/pdf",
      fileName: "expense-report.pdf",
      body: buildPdf(expenses),
    };
  }

  if (format === "json") {
    return {
      contentType: "application/json",
      fileName: "expense-report.json",
      body: JSON.stringify({ success: true, data: expenses }, null, 2),
    };
  }

  return {
    contentType: "text/csv",
    fileName: "expense-report.csv",
    body: buildCsv(expenses),
  };
};

export default { getReportExport };

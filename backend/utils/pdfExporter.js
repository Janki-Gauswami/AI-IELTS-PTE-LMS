const PDFDocument = require("pdfkit");

// ==============================================
// Attendance PDF Export Utility
// ==============================================

const exportAttendancePDF = (attendance, res) => {
  const doc = new PDFDocument({
    margin: 30,
    size: "A4",
  });

  doc.pipe(res);

  // Title
  doc
    .fontSize(20)
    .text("Attendance Report", {
      align: "center",
    });

  doc.moveDown();

  doc
    .fontSize(10)
    .text(`Generated: ${new Date().toLocaleString()}`);

  doc.moveDown();

  attendance.forEach((record, index) => {
    doc
      .fontSize(12)
      .text(`${index + 1}. Student : ${record.student?.fullName || "-"}`);

    doc.text(`Email     : ${record.student?.email || "-"}`);

    doc.text(`Teacher   : ${record.teacher?.fullName || "-"}`);

    doc.text(`Batch     : ${record.batch?.batchName || "-"}`);

    doc.text(`Course    : ${record.batch?.course || "-"}`);

    doc.text(
      `Date      : ${
        record.date
          ? new Date(record.date).toLocaleDateString("en-IN")
          : "-"
      }`
    );

    doc.text(`Status    : ${record.status}`);

    doc.text(`Remarks   : ${record.remarks || "-"}`);

    doc.moveDown();
    doc.moveTo(30, doc.y).lineTo(565, doc.y).stroke();
    doc.moveDown();
  });

  doc.end();
};

module.exports = exportAttendancePDF;
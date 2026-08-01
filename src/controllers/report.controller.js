import reportService from "../services/report.service.js";

const exportReport = async (req, res) => {
  try {
    const format = (req.query.format || "csv").toLowerCase();
    const report = await reportService.getReportExport(req.user.userId, format);

    res.setHeader("Content-Type", report.contentType);
    res.setHeader("Content-Disposition", `attachment; filename=${report.fileName}`);
    return res.status(200).send(report.body);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { exportReport };

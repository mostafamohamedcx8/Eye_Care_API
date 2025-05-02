const Report = require("../models/reportModel");

class ReportService {
  // Create a new report
  async createReport(reportData) {
    try {
      const report = new Report(reportData);
      return await report.save();
    } catch (error) {
      throw new Error(`Failed to create report: ${error.message}`);
    }
  }

  // Get a report by ID
  async getReportById(reportId) {
    try {
      const report = await Report.findById(reportId).populate("userId");
      if (!report) {
        throw new Error("Report not found");
      }
      return report;
    } catch (error) {
      throw new Error(`Failed to fetch report: ${error.message}`);
    }
  }

  // Get all reports for a user
  async getReportsByUserId(userId) {
    try {
      return await Report.find({ userId }).populate("userId");
    } catch (error) {
      throw new Error(`Failed to fetch user reports: ${error.message}`);
    }
  }

  // Update a report
  async updateReport(reportId, updateData) {
    try {
      const report = await Report.findByIdAndUpdate(
        reportId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      if (!report) {
        throw new Error("Report not found");
      }
      return report;
    } catch (error) {
      throw new Error(`Failed to update report: ${error.message}`);
    }
  }

  // Delete a report
  async deleteReport(reportId) {
    try {
      const report = await Report.findByIdAndDelete(reportId);
      if (!report) {
        throw new Error("Report not found");
      }
      return { message: "Report deleted successfully" };
    } catch (error) {
      throw new Error(`Failed to delete report: ${error.message}`);
    }
  }
}

module.exports = new ReportService();

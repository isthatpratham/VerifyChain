const complianceRecordRepository = require('../repositories/complianceRecord.repository');
const msmeProfileRepository = require('../repositories/msmeProfile.repository');

class ComplianceService {
  /**
   * List compliance records for an MSME with pagination, search, and filtering
   */
  async getComplianceRecords(msmeId, query = {}) {
    const profile = await msmeProfileRepository.findById(msmeId);
    if (!profile) {
      const error = new Error('MSME Profile not found. Please complete your profile setup first.');
      error.statusCode = 404;
      throw error;
    }

    const page = parseInt(query.page, 10) || 1;
    const limit = Math.min(parseInt(query.limit, 10) || 10, 100);
    const status = query.status || undefined;
    const priority = query.priority || undefined;
    const authority = query.authority || undefined;
    const search = query.search || undefined;
    const sortBy = query.sortBy || 'updated_at';
    const sortOrder = query.sortOrder || 'desc';

    return complianceRecordRepository.findPaginated({
      msmeId,
      status,
      priority,
      authority,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    });
  }

  /**
   * Get single compliance record by ID with ownership verification
   */
  async getComplianceRecordById(msmeId, recordId) {
    const id = parseInt(recordId, 10);
    if (isNaN(id)) {
      const error = new Error('Invalid compliance record ID format.');
      error.statusCode = 400;
      throw error;
    }

    const record = await complianceRecordRepository.findById(id);
    if (!record) {
      const error = new Error('Compliance record not found.');
      error.statusCode = 404;
      throw error;
    }

    if (record.msme_id !== msmeId) {
      const error = new Error('Unauthorized access. Record belongs to another business.');
      error.statusCode = 403;
      throw error;
    }

    return record;
  }

  /**
   * Create a new compliance record
   */
  async createComplianceRecord(msmeId, data) {
    const profile = await msmeProfileRepository.findById(msmeId);
    if (!profile) {
      const error = new Error('MSME Profile not found.');
      error.statusCode = 404;
      throw error;
    }

    // Check for duplicate authority record for this MSME
    const existing = await complianceRecordRepository.findByMsmeAndAuthority(msmeId, data.authority);
    if (existing) {
      const error = new Error(`Compliance record for authority '${data.authority}' already exists.`);
      error.statusCode = 400;
      throw error;
    }

    const payload = {
      msme_id: msmeId,
      authority: data.authority,
      status: data.status || 'UNKNOWN',
      priority: data.priority || 'MEDIUM',
      renewal_frequency: data.renewalFrequency || 'ANNUAL',
      risk_level: data.riskLevel || 'LOW',
      expiry_date: data.expiryDate ? new Date(data.expiryDate) : null,
      last_filed: data.lastFiled ? new Date(data.lastFiled) : null,
      filing_reference: data.filingReference || null,
      notes: data.notes || null,
      raw_data: data.rawData || null,
    };

    return complianceRecordRepository.create(payload);
  }

  /**
   * Update an existing compliance record
   */
  async updateComplianceRecord(msmeId, recordId, data) {
    const record = await this.getComplianceRecordById(msmeId, recordId);

    const payload = {};
    if (data.status !== undefined) payload.status = data.status;
    if (data.priority !== undefined) payload.priority = data.priority;
    if (data.renewalFrequency !== undefined) payload.renewal_frequency = data.renewalFrequency;
    if (data.riskLevel !== undefined) payload.risk_level = data.riskLevel;
    if (data.expiryDate !== undefined) payload.expiry_date = data.expiryDate ? new Date(data.expiryDate) : null;
    if (data.lastFiled !== undefined) payload.last_filed = data.lastFiled ? new Date(data.lastFiled) : null;
    if (data.filingReference !== undefined) payload.filing_reference = data.filingReference;
    if (data.notes !== undefined) payload.notes = data.notes;
    if (data.rawData !== undefined) payload.raw_data = data.rawData;
    payload.updated_at = new Date();

    return complianceRecordRepository.update({ id: record.id }, payload);
  }

  /**
   * Delete a compliance record
   */
  async deleteComplianceRecord(msmeId, recordId) {
    const record = await this.getComplianceRecordById(msmeId, recordId);
    return complianceRecordRepository.delete({ id: record.id });
  }
}

module.exports = new ComplianceService();

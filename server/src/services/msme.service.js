const { msmeProfileRepository } = require('../repositories');
const { DuplicateError, NotFoundError, ValidationError } = require('../utils/dbErrors');
const complianceOrchestratorService = require('./complianceOrchestrator.service');
const businessEventDispatcher = require('../events/BusinessEventDispatcher');

class MsmeService {
  async createProfile(userId, profileData) {
    const existingProfile = await msmeProfileRepository.findByUserId(userId);
    if (existingProfile) {
      throw new DuplicateError('MSME profile already exists for this user account');
    }

    const existingGstin = await msmeProfileRepository.findByGstin(profileData.gstin);
    if (existingGstin) {
      throw new DuplicateError('GSTIN is already registered with another MSME profile');
    }

    const existingUdyam = await msmeProfileRepository.findByUdyamNumber(profileData.udyamNumber);
    if (existingUdyam) {
      throw new DuplicateError('Udyam registration number is already registered with another MSME profile');
    }

    const newProfile = await msmeProfileRepository.create({
      user_id: userId,
      business_name: profileData.businessName,
      gstin: profileData.gstin,
      udyam_number: profileData.udyamNumber,
      business_type: profileData.businessType,
      sector: profileData.sector,
      state: profileData.state,
      district: profileData.district,
      employee_count: profileData.employeeCount,
      annual_turnover_lakh: profileData.annualTurnoverLakh !== undefined ? profileData.annualTurnoverLakh : null,
      is_food_business: profileData.isFoodBusiness || false,
      is_profile_complete: true,
      last_compliance_sync: new Date(),
    });

    console.log(`[MsmeService] Business profile created for user ${userId} (MSME ID: ${newProfile.id})`);

    // Synchronize via Orchestration Layer
    try {
      await complianceOrchestratorService.synchronizeCompliance(newProfile.id);
      businessEventDispatcher.emitBusinessEvent(businessEventDispatcher.EVENTS.BUSINESS_CREATED, {
        msmeId: newProfile.id,
      });
    } catch (ruleErr) {
      console.warn(`[MsmeService] Orchestration synchronization warning for MSME ID ${newProfile.id}: ${ruleErr.message}`);
    }

    return {
      msmeProfile: {
        id: newProfile.id,
        businessName: newProfile.business_name,
        gstin: newProfile.gstin,
        isProfileComplete: newProfile.is_profile_complete,
      },
      message: 'Profile created. Compliance rules evaluated & synchronized.',
    };
  }

  async getProfileByUserId(userId) {
    const profile = await msmeProfileRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('MSME profile not found. Please complete your profile.');
    }

    return {
      id: profile.id,
      businessName: profile.business_name,
      gstin: profile.gstin,
      udyamNumber: profile.udyam_number,
      businessType: profile.business_type,
      sector: profile.sector,
      state: profile.state,
      district: profile.district,
      employeeCount: profile.employee_count,
      annualTurnoverLakh: profile.annual_turnover_lakh,
      isFoodBusiness: profile.is_food_business,
      isProfileComplete: profile.is_profile_complete,
      lastComplianceSync: profile.last_compliance_sync,
    };
  }

  async updateProfile(userId, updateFields) {
    const profile = await msmeProfileRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('MSME profile not found to update');
    }

    if (updateFields.gstin && updateFields.gstin !== profile.gstin) {
      const existingGstin = await msmeProfileRepository.findByGstin(updateFields.gstin);
      if (existingGstin) {
        throw new DuplicateError('GSTIN is already registered with another MSME profile');
      }
    }

    if (updateFields.udyamNumber && updateFields.udyamNumber !== profile.udyam_number) {
      const existingUdyam = await msmeProfileRepository.findByUdyamNumber(updateFields.udyamNumber);
      if (existingUdyam) {
        throw new DuplicateError('Udyam registration number is already registered with another MSME profile');
      }
    }

    const updateData = {};
    const changedFields = Object.keys(updateFields);

    if (updateFields.businessName !== undefined) updateData.business_name = updateFields.businessName;
    if (updateFields.gstin !== undefined) updateData.gstin = updateFields.gstin;
    if (updateFields.udyamNumber !== undefined) updateData.udyam_number = updateFields.udyamNumber;
    if (updateFields.businessType !== undefined) updateData.business_type = updateFields.businessType;
    if (updateFields.sector !== undefined) updateData.sector = updateFields.sector;
    if (updateFields.state !== undefined) updateData.state = updateFields.state;
    if (updateFields.district !== undefined) updateData.district = updateFields.district;
    if (updateFields.employeeCount !== undefined) updateData.employee_count = updateFields.employeeCount;
    if (updateFields.annualTurnoverLakh !== undefined) updateData.annual_turnover_lakh = updateFields.annualTurnoverLakh;
    if (updateFields.isFoodBusiness !== undefined) updateData.is_food_business = updateFields.isFoodBusiness;

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError('No valid profile fields provided for update');
    }

    const updatedProfile = await msmeProfileRepository.update({ id: profile.id }, updateData);

    console.log(`[MsmeService] Business profile updated for MSME ID ${profile.id}`);

    // Selective re-evaluation trigger via Orchestration Layer
    try {
      await complianceOrchestratorService.handleBusinessUpdated(updatedProfile.id, changedFields);
      businessEventDispatcher.emitBusinessEvent(businessEventDispatcher.EVENTS.BUSINESS_UPDATED, {
        msmeId: updatedProfile.id,
        changedFields,
      });
    } catch (ruleErr) {
      console.warn(`[MsmeService] Orchestration re-evaluation warning for MSME ID ${updatedProfile.id}: ${ruleErr.message}`);
    }

    return {
      id: updatedProfile.id,
      businessName: updatedProfile.business_name,
      gstin: updatedProfile.gstin,
      udyamNumber: updatedProfile.udyam_number,
      businessType: updatedProfile.business_type,
      sector: updatedProfile.sector,
      state: updatedProfile.state,
      district: updatedProfile.district,
      employeeCount: updatedProfile.employee_count,
      annualTurnoverLakh: updatedProfile.annual_turnover_lakh,
      isFoodBusiness: updatedProfile.is_food_business,
      isProfileComplete: updatedProfile.is_profile_complete,
      lastComplianceSync: updatedProfile.last_compliance_sync,
    };
  }
}

module.exports = new MsmeService();

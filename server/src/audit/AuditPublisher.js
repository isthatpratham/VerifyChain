/**
 * AuditPublisher.js
 * Centralized Enterprise Audit Event Publisher for VerifyChain.
 * Receives audit events from all system modules, listens to DomainEventBus,
 * enriches audit telemetry, and persists records asynchronously into PostgreSQL.
 */

const defaultPrisma = require('../utils/prismaClient');
const domainEventBus = require('../events/DomainEventBus');

class AuditPublisher {
  constructor() {
    this.isSubscribed = false;
    this.subscribeToDomainEvents();
  }

  /**
   * Subscribe to DomainEventBus to automatically capture domain events as Audit Records
   */
  subscribeToDomainEvents() {
    if (this.isSubscribed) return;

    domainEventBus.subscribeAll((eventName, payload) => {
      try {
        this._handleDomainEvent(eventName, payload);
      } catch (err) {
        console.error(`[AuditPublisher] Error processing domain event '${eventName}':`, err.message);
      }
    });

    this.isSubscribed = true;
    if (process.env.NODE_ENV !== 'test') {
      console.log('[AuditPublisher] Centralized Enterprise Audit Pipeline bound to DomainEventBus.');
    }
  }

  /**
   * Internal mapper converting DomainEventBus events into Audit Records
   */
  _handleDomainEvent(eventName, payload = {}) {
    const msmeId = payload.msmeId || payload.msme_id || 1;
    const actorId = payload.actorId || payload.userId ? `USER_${payload.userId}` : `MSME_${msmeId}`;

    switch (eventName) {
      case 'BusinessCreated':
        this.publishBusiness({
          actorId,
          msmeId,
          module: 'BUSINESS_PROFILE',
          action: 'BUSINESS_PROFILE_CREATED',
          resourceType: 'MsmeProfile',
          resourceId: String(msmeId),
          changes: payload,
        });
        break;

      case 'BusinessUpdated':
        this.publishBusiness({
          actorId,
          msmeId,
          module: 'BUSINESS_PROFILE',
          action: 'BUSINESS_PROFILE_UPDATED',
          resourceType: 'MsmeProfile',
          resourceId: String(msmeId),
          changes: payload,
        });
        break;

      case 'ComplianceCreated':
        this.publishBusiness({
          actorId,
          msmeId,
          module: 'COMPLIANCE',
          action: 'COMPLIANCE_REQUIREMENT_CREATED',
          resourceType: 'ComplianceRequirement',
          resourceId: String(payload.requirementId || msmeId),
          changes: payload,
        });
        break;

      case 'ComplianceEvaluated':
      case 'ComplianceReevaluated':
      case 'ScoreCalculated':
        this.publishBusiness({
          actorId,
          msmeId,
          module: 'COMPLIANCE',
          action: 'COMPLIANCE_HEALTH_CALCULATED',
          resourceType: 'ComplianceHealthScore',
          resourceId: String(msmeId),
          changes: payload,
        });
        break;

      case 'SupplierTrustProfileCreated':
        this.publishBusiness({
          actorId,
          msmeId,
          module: 'SUPPLIER_TRUST',
          action: 'TRUST_PROFILE_CREATED',
          resourceType: 'SupplierTrustProfile',
          resourceId: String(payload.profileId || msmeId),
          changes: payload,
        });
        break;

      case 'TrustProfilePublished':
      case 'SupplierTrustPublished':
        this.publishBusiness({
          actorId,
          msmeId,
          module: 'SUPPLIER_TRUST',
          action: 'TRUST_PROFILE_PUBLISHED',
          resourceType: 'SupplierTrustProfile',
          resourceId: String(payload.profileId || msmeId),
          changes: payload,
        });
        break;

      case 'SupplierTrustDistributionPublished':
        this.publishBusiness({
          actorId,
          msmeId,
          module: 'DISTRIBUTION',
          action: 'DISTRIBUTION_PUBLISHED',
          resourceType: 'TrustDistributionIdentity',
          resourceId: String(msmeId),
          changes: payload,
        });
        break;

      case 'FutureQRGenerated':
      case 'QRCodeGenerated':
        this.publishBusiness({
          actorId,
          msmeId,
          module: 'DISTRIBUTION',
          action: 'QR_CODE_GENERATED',
          resourceType: 'TrustBadgeAsset',
          resourceId: String(payload.qrCodeId || msmeId),
          changes: payload,
        });
        break;

      case 'AlertTriggered':
        this.publishSecurity({
          actorId: 'SECURITY_ENGINE',
          msmeId,
          action: 'SECURITY_ALERT_TRIGGERED',
          severity: 'WARNING',
          status: 'SUCCESS',
          details: payload,
        });
        break;

      default:
        break;
    }
  }

  /**
   * Primary audit log publisher method
   */
  async publish({
    actorType = 'USER',
    actorId = 'SYSTEM',
    msmeId = 1,
    module = 'SYSTEM',
    action,
    resourceType = 'System',
    resourceId = '1',
    severity = 'INFO',
    status = 'SUCCESS',
    ipAddress = null,
    userAgent = null,
    correlationId = null,
    changes = {},
  }) {
    if (!action) {
      throw new Error('[AuditPublisher] Parameter \'action\' is required for audit event.');
    }

    const parsedMsmeId = msmeId ? parseInt(msmeId, 10) : 1;
    const finalCorrelationId = correlationId || `corr_audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const changesPayload = {
      ...changes,
      module,
      severity,
      status,
      msmeId: parsedMsmeId,
      correlationId: finalCorrelationId,
      publishedAt: new Date().toISOString(),
    };

    try {
      const record = await defaultPrisma.integrationAuditLog.create({
        data: {
          msme_id: parsedMsmeId,
          actor_type: actorType,
          actor_id: String(actorId),
          module,
          action,
          resource_type: resourceType,
          resource_id: String(resourceId),
          severity,
          status,
          correlation_id: finalCorrelationId,
          changes_json: changesPayload,
          ip_address: ipAddress || null,
          user_agent: userAgent || null,
        },
      });

      return record;
    } catch (err) {
      console.error('[AuditPublisher] Failed to persist audit record:', err.message);
      // Fallback create using core fields if extended fields fail
      return defaultPrisma.integrationAuditLog.create({
        data: {
          actor_type: actorType,
          actor_id: String(actorId),
          action,
          resource_type: resourceType,
          resource_id: String(resourceId),
          changes_json: changesPayload,
          ip_address: ipAddress || null,
          user_agent: userAgent || null,
        },
      }).catch(() => null);
    }
  }

  /**
   * Helper: Publish Authentication Event
   */
  async publishAuth({ actorId, msmeId = 1, action, status = 'SUCCESS', severity = 'INFO', ipAddress = null, userAgent = null, correlationId = null, details = {} }) {
    return this.publish({
      actorType: 'USER',
      actorId: actorId || 'ANONYMOUS',
      msmeId,
      module: 'AUTH',
      action,
      resourceType: 'UserSession',
      resourceId: String(actorId || '0'),
      severity: status === 'FAILURE' ? 'WARNING' : severity,
      status,
      ipAddress,
      userAgent,
      correlationId,
      changes: details,
    });
  }

  /**
   * Helper: Publish Business Profile / Module Event
   */
  async publishBusiness({ actorId, msmeId = 1, module = 'BUSINESS_PROFILE', action, resourceType, resourceId, severity = 'INFO', status = 'SUCCESS', ipAddress = null, userAgent = null, correlationId = null, changes = {} }) {
    return this.publish({
      actorType: 'USER',
      actorId: actorId || `MSME_${msmeId}`,
      msmeId,
      module,
      action,
      resourceType: resourceType || module,
      resourceId: String(resourceId || msmeId),
      severity,
      status,
      ipAddress,
      userAgent,
      correlationId,
      changes,
    });
  }

  /**
   * Helper: Publish Security Event
   */
  async publishSecurity({ actorId, msmeId = 1, action, severity = 'WARNING', status = 'FAILURE', ipAddress = null, userAgent = null, correlationId = null, details = {} }) {
    return this.publish({
      actorType: 'SECURITY_ENGINE',
      actorId: actorId || 'SYSTEM',
      msmeId,
      module: 'SECURITY',
      action,
      resourceType: 'SecurityPolicy',
      resourceId: String(msmeId),
      severity,
      status,
      ipAddress,
      userAgent,
      correlationId,
      changes: details,
    });
  }

  /**
   * Helper: Publish System Infrastructure Event
   */
  async publishSystem({ action, severity = 'INFO', status = 'SUCCESS', details = {} }) {
    return this.publish({
      actorType: 'SYSTEM',
      actorId: 'SYSTEM_DAEMON',
      msmeId: 1,
      module: 'SYSTEM',
      action,
      resourceType: 'SystemLifecycle',
      resourceId: 'SERVER_PROCESS',
      severity,
      status,
      changes: details,
    });
  }
}

module.exports = new AuditPublisher();

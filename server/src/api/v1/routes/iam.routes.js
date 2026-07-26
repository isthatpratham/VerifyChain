/**
 * iam.routes.js
 * REST API Endpoint Router for Enterprise IAM, Roles, Permissions & Access Control (Phase 11.2).
 */

const express = require('express');
const router = express.Router();
const IAMFacade = require('../../../iam/IAMFacade');
const { sendSuccess, sendError } = require('../../../utils/apiResponse');

// 1. Dashboard Statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    const stats = await IAMFacade.getIAMDashboardStats();
    return sendSuccess(res, stats, 'IAM Dashboard metrics fetched successfully.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

// 2. Permission Catalog
router.get('/permissions', async (req, res) => {
  try {
    const permissions = await IAMFacade.listPermissions(req.query.category);
    return sendSuccess(res, permissions, 'Permission catalog fetched.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

// 3. Role Directory & Custom Role Management
router.get('/roles', async (req, res) => {
  try {
    const roles = await IAMFacade.listRoles(req.query.msmeId);
    return sendSuccess(res, roles, 'Roles directory listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.post('/roles', async (req, res) => {
  try {
    const role = await IAMFacade.createCustomRole(req.body);
    return sendSuccess(res, role, 'Custom role created successfully.', 201);
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.get('/roles/:id', async (req, res) => {
  try {
    const role = await IAMFacade.getRoleById(req.params.id);
    return sendSuccess(res, role, 'Role details fetched.');
  } catch (err) {
    return sendError(res, err.message, 404);
  }
});

router.get('/roles/:id/effective-permissions', async (req, res) => {
  try {
    const effectivePerms = await IAMFacade.resolveEffectivePermissions(req.params.id);
    return sendSuccess(res, effectivePerms, 'Effective inherited permissions resolved.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

// 4. Centralized Authorization Simulator / Evaluation
router.post('/authorize/evaluate', async (req, res) => {
  try {
    const decision = await IAMFacade.can(req.body);
    return sendSuccess(res, decision, 'Authorization evaluation complete.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

// 5. Role Assignments
router.get('/assignments', async (req, res) => {
  try {
    const assignments = await IAMFacade.listAssignments(req.query);
    return sendSuccess(res, assignments, 'Role assignments listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.post('/assignments', async (req, res) => {
  try {
    const assignment = await IAMFacade.assignRole({
      ...req.body,
      assignedBy: req.user?.id ? `USER_${req.user.id}` : 'ADMIN',
    });
    return sendSuccess(res, assignment, 'Role assigned to user.', 201);
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.delete('/assignments/:id', async (req, res) => {
  try {
    const result = await IAMFacade.removeRoleAssignment(
      req.params.id,
      req.user?.id ? `USER_${req.user.id}` : 'ADMIN'
    );
    return sendSuccess(res, result, 'Role assignment revoked.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

// 6. Time-Bound Temporary Access Management
router.get('/temporary-access', async (req, res) => {
  try {
    const grants = await IAMFacade.listGrants(req.query);
    return sendSuccess(res, grants, 'Temporary access grants listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.post('/temporary-access', async (req, res) => {
  try {
    const grant = await IAMFacade.grantTemporaryAccess({
      ...req.body,
      grantedBy: req.user?.id ? `USER_${req.user.id}` : 'ADMIN',
    });
    return sendSuccess(res, grant, 'Time-bound temporary access granted.', 201);
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.post('/temporary-access/:id/revoke', async (req, res) => {
  try {
    const result = await IAMFacade.revokeTemporaryAccess(
      req.params.id,
      req.user?.id ? `USER_${req.user.id}` : 'ADMIN'
    );
    return sendSuccess(res, result, 'Temporary access grant revoked.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

// 7. Administrative Access Review Audits
router.get('/access-reviews', async (req, res) => {
  try {
    const reviews = await IAMFacade.listReviews(req.query.msmeId);
    return sendSuccess(res, reviews, 'Access review audit logs listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.post('/access-reviews', async (req, res) => {
  try {
    const review = await IAMFacade.conductAccessReview({
      ...req.body,
      reviewerId: req.user?.id ? `USER_${req.user.id}` : 'ADMIN',
    });
    return sendSuccess(res, review, 'Administrative access review audit completed.', 201);
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

module.exports = router;

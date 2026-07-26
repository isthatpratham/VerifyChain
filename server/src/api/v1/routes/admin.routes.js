/**
 * admin.routes.js
 * REST API Endpoint Router for Enterprise Identity & Platform Administration (Phase 11.1).
 */

const express = require('express');
const router = express.Router();
const IdentityFacade = require('../../../identity/IdentityFacade');
const { sendSuccess, sendError } = require('../../../utils/apiResponse');

// 1. Dashboard Statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    const stats = await IdentityFacade.getDashboardMetrics();
    return sendSuccess(res, stats, 'Administration metrics fetched successfully.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

// 2. User Administration CRUD
router.get('/users', async (req, res) => {
  try {
    const users = await IdentityFacade.listUsers(req.query);
    return sendSuccess(res, users, 'Platform users listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.post('/users', async (req, res) => {
  try {
    const user = await IdentityFacade.createUser(req.body);
    return sendSuccess(res, user, 'Platform user identity created.', 201);
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await IdentityFacade.getUserById(req.params.id);
    return sendSuccess(res, user, 'User details fetched.');
  } catch (err) {
    return sendError(res, err.message, 404);
  }
});

router.put('/users/:id/profile', async (req, res) => {
  try {
    const profile = await IdentityFacade.updateProfile(req.params.id, req.body);
    return sendSuccess(res, profile, 'User profile updated.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.post('/users/:id/status', async (req, res) => {
  try {
    const result = await IdentityFacade.transitionUserStatus({
      userId: req.params.id,
      targetStatus: req.body.targetStatus,
      reason: req.body.reason,
      changedBy: req.user?.id ? `USER_${req.user.id}` : 'ADMIN',
    });
    return sendSuccess(res, result, 'User lifecycle status transitioned.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

// 3. Organization Administration CRUD
router.get('/organizations', async (req, res) => {
  try {
    const orgs = await IdentityFacade.listOrganizations(req.query);
    return sendSuccess(res, orgs, 'Platform organizations listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.post('/organizations', async (req, res) => {
  try {
    const org = await IdentityFacade.createOrganization(req.body);
    return sendSuccess(res, org, 'Platform organization created.', 201);
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.get('/organizations/:id', async (req, res) => {
  try {
    const org = await IdentityFacade.getOrganizationById(req.params.id);
    return sendSuccess(res, org, 'Organization details fetched.');
  } catch (err) {
    return sendError(res, err.message, 404);
  }
});

router.put('/organizations/:id', async (req, res) => {
  try {
    const org = await IdentityFacade.updateOrganization(req.params.id, req.body);
    return sendSuccess(res, org, 'Organization administrative settings updated.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.post('/organizations/:id/status', async (req, res) => {
  try {
    const result = await IdentityFacade.transitionOrganizationStatus({
      organizationId: req.params.id,
      targetStatus: req.body.targetStatus,
      reason: req.body.reason,
      changedBy: req.user?.id ? `USER_${req.user.id}` : 'ADMIN',
    });
    return sendSuccess(res, result, 'Organization lifecycle status transitioned.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

// 4. Organization Membership Management
router.get('/organizations/:id/members', async (req, res) => {
  try {
    const members = await IdentityFacade.listMembers(req.params.id);
    return sendSuccess(res, members, 'Organization members listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.post('/memberships', async (req, res) => {
  try {
    const membership = await IdentityFacade.addMember(req.body);
    return sendSuccess(res, membership, 'Organization member added.', 201);
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.delete('/memberships', async (req, res) => {
  try {
    const result = await IdentityFacade.removeMember(req.body);
    return sendSuccess(res, result, 'Organization member removed.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.post('/memberships/switch', async (req, res) => {
  try {
    const result = await IdentityFacade.switchPrimaryOrganization(req.body);
    return sendSuccess(res, result, 'Active primary organization switched.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

// 5. Invitation System
router.get('/invitations', async (req, res) => {
  try {
    const invitations = await IdentityFacade.listInvitations(req.query);
    return sendSuccess(res, invitations, 'Invitations listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.post('/invitations', async (req, res) => {
  try {
    const invitation = await IdentityFacade.createInvitation(req.body);
    return sendSuccess(res, invitation, 'Invitation created & sent.', 201);
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.post('/invitations/:id/resend', async (req, res) => {
  try {
    const result = await IdentityFacade.resendInvitation(req.params.id);
    return sendSuccess(res, result, 'Invitation resent.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.post('/invitations/:id/cancel', async (req, res) => {
  try {
    const result = await IdentityFacade.cancelInvitation(req.params.id);
    return sendSuccess(res, result, 'Invitation cancelled.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.post('/invitations/accept', async (req, res) => {
  try {
    const result = await IdentityFacade.acceptInvitation(req.body);
    return sendSuccess(res, result, 'Invitation accepted & membership provisioned.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.post('/invitations/bulk', async (req, res) => {
  try {
    const results = await IdentityFacade.bulkInvite(req.body);
    return sendSuccess(res, results, 'Bulk invitations processed.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

// 6. Universal Administration Search
router.get('/search', async (req, res) => {
  try {
    const results = await IdentityFacade.search(req.query);
    return sendSuccess(res, results, 'Administration search results.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

module.exports = router;

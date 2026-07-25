const { userRepository, msmeProfileRepository } = require('../repositories');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { DuplicateError, ValidationError } = require('../utils/dbErrors');
const AuditPublisher = require('../audit/AuditPublisher');

class AuthService {
  async registerUser({ name, email, password, phone }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      AuditPublisher.publishAuth({
        actorId: email,
        msmeId: 1,
        action: 'AUTH_REGISTER_FAILED',
        status: 'FAILURE',
        severity: 'WARNING',
        details: { email, reason: 'Duplicate email address' },
      }).catch(() => {});

      throw new DuplicateError('Email address is already registered');
    }

    const passwordHash = await hashPassword(password);

    const newUser = await userRepository.create({
      name,
      email,
      password_hash: passwordHash,
      phone: phone || null,
      role: 'MSME_OWNER',
    });

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      msmeId: null,
    });

    AuditPublisher.publishAuth({
      actorId: `USER_${newUser.id}`,
      msmeId: 1,
      action: 'AUTH_REGISTER_SUCCESS',
      status: 'SUCCESS',
      details: { email: newUser.email, role: newUser.role, name: newUser.name },
    }).catch(() => {});

    return {
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    };
  }

  async loginUser({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      AuditPublisher.publishAuth({
        actorId: email,
        msmeId: 1,
        action: 'AUTH_LOGIN_FAILED',
        status: 'FAILURE',
        severity: 'WARNING',
        details: { email, reason: 'Invalid user email' },
      }).catch(() => {});

      throw new ValidationError('Invalid email or password');
    }

    if (!user.is_active) {
      AuditPublisher.publishAuth({
        actorId: `USER_${user.id}`,
        msmeId: 1,
        action: 'AUTH_LOGIN_FAILED',
        status: 'FAILURE',
        severity: 'WARNING',
        details: { email, reason: 'Account inactive' },
      }).catch(() => {});

      throw new ValidationError('User account is inactive');
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      AuditPublisher.publishAuth({
        actorId: `USER_${user.id}`,
        msmeId: 1,
        action: 'AUTH_LOGIN_FAILED',
        status: 'FAILURE',
        severity: 'WARNING',
        details: { email, reason: 'Password mismatch' },
      }).catch(() => {});

      throw new ValidationError('Invalid email or password');
    }

    const msmeProfile = await msmeProfileRepository.findByUserId(user.id);
    const msmeId = msmeProfile ? msmeProfile.id : 1;

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      msmeId,
    });

    AuditPublisher.publishAuth({
      actorId: `USER_${user.id}`,
      msmeId,
      action: 'AUTH_LOGIN_SUCCESS',
      status: 'SUCCESS',
      severity: 'INFO',
      details: { email: user.email, role: user.role, msmeId },
    }).catch(() => {});

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        msmeId,
      },
    };
  }

  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId, {
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    if (!user) {
      throw new ValidationError('User not found');
    }

    const msmeProfile = await msmeProfileRepository.findByUserId(user.id);
    const msmeId = msmeProfile ? msmeProfile.id : 1;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      msmeId,
      createdAt: user.created_at,
    };
  }
}

module.exports = new AuthService();

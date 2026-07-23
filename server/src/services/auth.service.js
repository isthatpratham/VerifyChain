const { userRepository, msmeProfileRepository } = require('../repositories');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { DuplicateError, ValidationError } = require('../utils/dbErrors');

class AuthService {
  async registerUser({ name, email, password, phone }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
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
      throw new ValidationError('Invalid email or password');
    }

    if (!user.is_active) {
      throw new ValidationError('User account is inactive');
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      throw new ValidationError('Invalid email or password');
    }

    const msmeProfile = await msmeProfileRepository.findByUserId(user.id);
    const msmeId = msmeProfile ? msmeProfile.id : null;

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      msmeId,
    });

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
    const msmeId = msmeProfile ? msmeProfile.id : null;

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

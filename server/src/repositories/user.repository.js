const BaseRepository = require('./base.repository');

class UserRepository extends BaseRepository {
  constructor() {
    super('user');
  }

  async findByEmail(email, client) {
    return this.findUnique({ email }, {}, client);
  }
}

module.exports = new UserRepository();

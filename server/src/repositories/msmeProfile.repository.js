const BaseRepository = require('./base.repository');

class MsmeProfileRepository extends BaseRepository {
  constructor() {
    super('msmeProfile');
  }

  async findByUserId(userId, client) {
    return this.findUnique({ user_id: userId }, {}, client);
  }

  async findByGstin(gstin, client) {
    return this.findUnique({ gstin }, {}, client);
  }

  async findByUdyamNumber(udyamNumber, client) {
    return this.findUnique({ udyam_number: udyamNumber }, {}, client);
  }
}

module.exports = new MsmeProfileRepository();

const BaseRepository = require('./base.repository');

class BuyerViewLogRepository extends BaseRepository {
  constructor() {
    super('buyerViewLog');
  }
}

module.exports = new BuyerViewLogRepository();

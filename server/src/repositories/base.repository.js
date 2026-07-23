const defaultPrisma = require('../utils/prismaClient');
const { mapPrismaError } = require('../utils/dbErrors');

class BaseRepository {
  constructor(modelName) {
    this.modelName = modelName;
  }

  getModel(client = defaultPrisma) {
    if (!client[this.modelName]) {
      throw new Error(`Model ${this.modelName} does not exist on Prisma client`);
    }
    return client[this.modelName];
  }

  async findById(id, options = {}, client = defaultPrisma) {
    try {
      return await this.getModel(client).findUnique({
        where: { id },
        ...options,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findUnique(where, options = {}, client = defaultPrisma) {
    try {
      return await this.getModel(client).findUnique({
        where,
        ...options,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findFirst(where, options = {}, client = defaultPrisma) {
    try {
      return await this.getModel(client).findFirst({
        where,
        ...options,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findMany(params = {}, client = defaultPrisma) {
    try {
      const { where, select, include, orderBy, skip, take } = params;
      return await this.getModel(client).findMany({
        where,
        select,
        include,
        orderBy,
        skip,
        take,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async create(data, options = {}, client = defaultPrisma) {
    try {
      return await this.getModel(client).create({
        data,
        ...options,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async update(where, data, options = {}, client = defaultPrisma) {
    try {
      return await this.getModel(client).update({
        where,
        data,
        ...options,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async upsert(where, create, update, options = {}, client = defaultPrisma) {
    try {
      return await this.getModel(client).upsert({
        where,
        create,
        update,
        ...options,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async delete(where, client = defaultPrisma) {
    try {
      return await this.getModel(client).delete({
        where,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async deleteMany(where = {}, client = defaultPrisma) {
    try {
      return await this.getModel(client).deleteMany({
        where,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async count(where = {}, client = defaultPrisma) {
    try {
      return await this.getModel(client).count({
        where,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async exists(where, client = defaultPrisma) {
    try {
      const count = await this.getModel(client).count({
        where,
      });
      return count > 0;
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}

module.exports = BaseRepository;

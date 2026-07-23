const prisma = require('../utils/prismaClient');
const { mapPrismaError } = require('../utils/dbErrors');

const executeTransaction = async (fn, options = {}) => {
  try {
    return await prisma.$transaction(async (tx) => {
      return await fn(tx);
    }, options);
  } catch (error) {
    throw mapPrismaError(error);
  }
};

const executeBatchTransaction = async (operations = []) => {
  try {
    return await prisma.$transaction(operations);
  } catch (error) {
    throw mapPrismaError(error);
  }
};

module.exports = {
  executeTransaction,
  executeBatchTransaction,
};

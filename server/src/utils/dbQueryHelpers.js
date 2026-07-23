const getPaginationParams = (page = 1, limit = 10) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (parsedPage - 1) * parsedLimit;

  return {
    skip,
    take: parsedLimit,
    page: parsedPage,
    limit: parsedLimit,
  };
};

const formatPaginatedResponse = (items, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    data: items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

const getSortParams = (sortBy, sortOrder = 'asc', allowedFields = []) => {
  if (!sortBy || (allowedFields.length > 0 && !allowedFields.includes(sortBy))) {
    return undefined;
  }
  const order = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';
  return { [sortBy]: order };
};

const buildFilterClause = (filters = {}) => {
  const where = {};
  Object.keys(filters).forEach((key) => {
    const value = filters[key];
    if (value !== undefined && value !== null && value !== '') {
      where[key] = value;
    }
  });
  return where;
};

module.exports = {
  getPaginationParams,
  formatPaginatedResponse,
  getSortParams,
  buildFilterClause,
};

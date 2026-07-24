/**
 * apiQueryParams.js
 * Utility to parse, validate, and sanitize REST query parameters for filtering,
 * sorting, searching, and pagination.
 */

function parseQueryParams(query = {}, allowedSortFields = ['id', 'created_at', 'updated_at']) {
  // Pagination
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > 100) limit = 100; // Enforce max limit of 100

  const skip = (page - 1) * limit;

  // Sorting
  let sortBy = query.sortBy || 'created_at';
  let sortOrder = (query.sortOrder || 'desc').toLowerCase();

  if (!allowedSortFields.includes(sortBy)) {
    sortBy = allowedSortFields[0] || 'id';
  }

  if (sortOrder !== 'asc' && sortOrder !== 'desc') {
    sortOrder = 'desc';
  }

  // Search
  const search = query.search ? String(query.search).trim() : null;

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
    search,
    orderBy: { [sortBy]: sortOrder },
  };
}

/**
 * Format standard pagination metadata object
 */
function createPaginationMeta(totalRecords, page, limit) {
  const totalPages = Math.ceil(totalRecords / limit) || 1;
  return {
    total: totalRecords,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

module.exports = {
  parseQueryParams,
  createPaginationMeta,
};

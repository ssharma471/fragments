// src/routes/api/get.js

/**
 * Get a list of fragments for the current user
 */
const { createSuccessResponse } = require('../../response');

module.exports = (req, res) => {
  const fragments = []; // Replace with your data retrieval logic here

  res.status(200).json(createSuccessResponse({
    status: 'ok',
    fragments,
  }));
};
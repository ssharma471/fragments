// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');

const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');

// Create a router on which to mount our API endpoints
const router = express.Router();

const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      const { type } = contentType.parse(req);
      return Fragment.isSupportedType(type);
    },
  });
// Define our first route, which will be: GET /v1/fragments
router.get('/fragments', require('./get'));

// Other routes will go here later on...

router.post('/fragments', rawBody(), require('./post'));

module.exports = router;
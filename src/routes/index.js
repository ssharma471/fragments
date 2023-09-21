const express = require('express');
const { version, author } = require('../../package.json');
const { authenticate } = require('../auth');

const router = express.Router();
router.use(`/v1`, authenticate(), require('./api'));

// Define a simple health check route.
router.get('/', (req, res) => {
    // Clients shouldn't cache this response (always request it fresh)
    res.setHeader('Cache-Control', 'no-cache');

    // Send a 200 'OK' response with info about our repo
    res.status(200).json({
        status: 'ok',
        author: author, // Change this to your GitHub username
        githubUrl: 'https://github.com/ssharma471/fragments', // Update with your repo URL
        version: version,
    });
});

module.exports = router;

const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');
const express = require('express');
const router = express.Router();

router.post('/fragments', async (req, res) => {
    // Check for supported content type
    const { type } = contentType.parse(req.headers['content-type']);
    if (!Fragment.isSupportedType(type)) {
      return res.status(415).json({ status: 'error', message: 'Unsupported content type' });
    }

    const fragment = new Fragment({
      ownerId: req.user, // Assuming you have middleware setting req.user for authenticated users
      type,
      size: req.body.length,
    });

    await fragment.setData(req.body);
    await fragment.save();

    const baseURL = process.env.API_URL || `http://${req.headers.host}`;
    const location = new URL(`/v1/fragments/${fragment.id}`, baseURL).toString();
    res.setHeader('Location', location);
// console.log("POST JS", responseBody);
    // Response directly includes fragment details
    const responseBody = { ...fragment };
    res.setHeader('Content-Type', 'application/json');
    res.status(201).json(responseBody);
  } 
);

module.exports = router;

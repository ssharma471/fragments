const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());

const fragments = []; 

app.post('/fragments', (req, res) => {
  const { type, content } = req.body;

  if (!type || !content) {
    return res.status(400).json({ error: 'Type and content are required.' });
  }

  const fragment = {
    id: fragments.length + 1,
    type,
    content,
  };

  fragments.push(fragment);

  res.status(201).json(fragment);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

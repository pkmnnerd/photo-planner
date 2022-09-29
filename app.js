const config = require('./config');
const express = require('express');
const app = express();
const router = express.Router()
const basePath = config.basePath;

router.get('/hello', (req, res) => {
  res.send(`Hello World!`);
});

router.use(express.static('public'))

// Add basePath as prefix to all routes in the router
app.use(basePath, router);

const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`helloworld: listening on port ${port}`);
});

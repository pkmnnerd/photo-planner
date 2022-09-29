import * as dotenv from 'dotenv'
dotenv.config()
import config from './config.js';
import express from 'express';
import { searchPhotos } from './search.js';
const app = express();
const router = express.Router();
const basePath = config.basePath;

const PHOTOS_URL = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&sort=relevance&has_geo=1&per_page=25' +
  `&api_key=${process.env.API_KEY}&format=json`;

router.get('/search', async (req, res) => {
  const searchText = req.query.text;
  await searchPhotos(res, searchText);
  
});

router.use(express.static('public'))

// Add basePath as prefix to all routes in the router
app.use(basePath, router);

const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`helloworld: listening on port ${port}`);
});

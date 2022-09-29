
import * as dotenv from 'dotenv'
dotenv.config()
import fetch from 'node-fetch';

const PHOTOS_URL = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&sort=relevance&has_geo=1&per_page=25' +
  `&api_key=${process.env.API_KEY}&format=json&extras=geo`;

const EXIF_URL= 'https://api.flickr.com/services/rest/?' +
  `method=flickr.photos.getExif&api_key=${process.env.API_KEY}&format=json`;

const GEO_URL = 'https://api.flickr.com/services/rest/?method=flickr.photos.geo.getLocation&' +
        `&api_key=${process.env.API_KEY}&format=json`;

const IDS = [
  'Make',
  'Model',
  'Exposure',
  'Aperture',
  'ISO Speed',
  'Date and Time (Original)',
  'Focal Length',
  'Focal Length (35mm format)',
  'Lens Model'
]

const getExifData = async (id, secret, photo, res) => {

  const exifResponse = await fetch(EXIF_URL + `&photo_id=${id}&secret=${secret}`)
  if (exifResponse.status !== 200) {
    res.status(500).send('Something went wrong');
    return;
  }
  const data = await exifResponse.text();
  const etext = JSON.parse(data.substring(14, data.length - 1));
  const elist = []
  if (etext.photo) {
    const set = new Set()
    const exif = etext.photo.exif;
    exif.forEach((e) => {
      if (e.label && IDS.includes(e.label) && !set.has(e.label)) {
        const edata = {
          label: e.label,
          data: e.clean ? e.clean._content : e.raw._content,
        };
        set.add(e.label);
        elist.push(edata);
      }
    });
  }
  photo.exif = elist;
}

export const searchPhotos = async (res, searchText) => {
  console.log(searchText);
  const response = await fetch(PHOTOS_URL + `&text=${searchText}`);
  if (response.status !== 200) {
    res.status(500).send('Something went wrong');
    return;
  }
  const data = await response.text();
  const jsonData = JSON.parse(data.substring(14, data.length - 1));
  if (jsonData.stat === "fail") {
    res.status(500).send(jsonData);
    return;
  }
  const photos = await Promise.all(jsonData.photos.photo.map(async (p) => {
    const photo = {
      id: p.id,
      server: p.server,
      user: p.owner,
      secret: p.secret,
      title: p.title,
      latitude: p.latitude,
      longitude: p.longitude,
    };
    await getExifData(p.id, p.secret, photo, res);
    return photo;
  }));
  res.send(photos);
  
  return;
}


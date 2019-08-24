'use strict';

const rp = require('request-promise');
const cheerio = require('cheerio');

const baseSerieUrl =
  'https://www.mdcu-comics.fr/includes/comics/inc_liste_comics_vf.php?series_collect_id=';

const options = {
  uri:
    'https://www.mdcu-comics.fr/includes/comics/inc_select_collection_vf.php?collection_id=469',
  transform(body) {
    return cheerio.load(body);
  },
};

const uris = [];
const collections = [];

const fetchBook = async url => {
  const response = await rp({
    url,
    transform(body) {
      return cheerio.load(body);
    },
  });

  return Promise.resolve(response);
};

const fetchSerie = url => {
  rp({
    url,
    transform(body) {
      return cheerio.load(body);
    },
  })
    .then($ => {
      const titleSerie = $('h4.page-header span')
        .text()
        .replace('Marvel NOW!', '');

      if (typeof collections[titleSerie] === 'undefined') {
        collections[titleSerie] = [];
      }

      $('div.col-4 > div > div:nth-child(2) > a').each((_, el) => {
        const bookUrl = $(el).attr().href;
        fetchBook(bookUrl).then(r => {
          const title = r('.widget-item > h4:nth-child(1)').text();
          const date = r('.meta')
            .text()
            .replace('Sortie le ', '');

          collections[titleSerie].push({
            title,
            date,
          });
        });
      });
    })
    .catch(err => {
      console.log(err);
    });
};

rp(options)
  .then($ => {
    $('div.p-y-5').each((_, el) => {
      const uri = $(el)
        .find('button')
        .attr();

      if (typeof uri !== 'undefined') {
        // @TODO use the serie ID to store a proper array
        const serieUrl = `${baseSerieUrl}${uri.series_collect_id}`;
        uris.push(serieUrl);
      }
    });

    uris.forEach(el => {
      // @TODO use Promises to fetch all at once, get the result here
      fetchSerie(el);
    });
  })
  .catch(err => {
    console.log(err);
  });

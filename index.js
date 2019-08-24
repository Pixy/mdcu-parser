'use strict';

const rp = require('request-promise');
const cheerio = require('cheerio');
const baseUrl =
  'https://www.mdcu-comics.fr/comics/editeur-01-panini-comics/collection-469-marvel-now/';

const options = {
  uri:
    'https://www.mdcu-comics.fr/includes/comics/inc_select_collection_vf.php?collection_id=469',
  transform(body) {
    return cheerio.load(body);
  },
};

let uris = [];

const fetchUri = uri => {
  const url = baseUrl + uri;
  console.log(url);
  // rp({
  //   `${baseUrl}${uri}`,
  //   transform(body) {
  //     return cheerio.load(body);
  //   },
  // })
  //   .then($ => {
  //     console.log($);
  //   })
  //   .catch(err => {
  //     console.log(err);
  //   });
};

rp(options)
  .then($ => {
    $('div.p-y-5').each(function(_, el) {
      const uri = $(this)
        .find('button')
        .attr();
      if (typeof uri !== 'undefined') {
        const serieUrl = `serie-${uri.series_collect_id}-${uri['data-url']}/`;
        uris.push(serieUrl);
      }
    });

    uris.forEach(el => {
      fetchUri(el);
    });
  })
  .catch(err => {
    console.log(err);
  });

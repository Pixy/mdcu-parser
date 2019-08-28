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

const fetchBook = async url => {
  const response = await rp({
    url,
    transform(body) {
      return cheerio.load(body);
    },
  });

  return Promise.resolve(response);
};

const fetchVolumes = serie =>
  rp({
    uri: serie.url,
    transform(body) {
      return cheerio.load(body);
    },
  });

// Get the root page
const fetchAll = () => {
  const series = [];
  rp(options)
    .then($ => {
      // Get all series links
      $('div.p-y-5').each((_, el) => {
        const attrs = $(el)
          .find('button')
          .attr();

        // Save IDs and urls in array
        if (typeof attrs !== 'undefined') {
          const serieUrl = `${baseSerieUrl}${attrs.series_collect_id}`;
          series.push({
            id: attrs.series_collect_id,
            url: serieUrl,
          });
        }
      });

      // Foreach series
      series.forEach(async serie => {
        // Get all volumes links
        try {
          const data = await fetchVolumes(serie);
          // Here we are on a serie page, that contains serie title and volumes
          const collections = [];
          const titleSerie = data('h4.page-header span')
            .text()
            .replace('Marvel NOW!', '');

          const bookUrls = [];
          data('div.col-4 > div > div:nth-child(2) > a').each((_, volume) => {
            bookUrls.push($(volume).attr().href);
          });

          collections[serie.id] = {
            titleSerie,
            books: [],
          };

          // We fetch here all volumes to get the single volume URL
          data('div.col-4 > div > div:nth-child(2) > a').each((_, volume) => {
            const bookUrl = $(volume).attr().href;
            // Now we fetch the volume data
            fetchBook(bookUrl).then(r => {
              const title = r('.widget-item > h4:nth-child(1)').text();
              const date = r('.meta')
                .text()
                .replace('Sortie le ', '');

              collections[serie.id].books.push({ title, date });
              console.log(collections);
            });
          });
        } catch (err) {
          console.log(err);
        }
      });
    })
    .catch(err => {
      console.log(err);
    });
};

fetchAll();

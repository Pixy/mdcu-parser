const rp = require('request-promise')
const cheerio = require('cheerio')
const rootPage = {
  uri:
    'https://www.mdcu-comics.fr/includes/comics/inc_select_collection_vf.php?collection_id=469',
  transform(body) {
    return cheerio.load(body)
  },
}
const baseSerieUrl =
  'https://www.mdcu-comics.fr/includes/comics/inc_liste_comics_vf.php?series_collect_id='

const Serie = require('./db/Serie')
const connection = require('./db/connection')

connection.on('open', initParser)

async function initParser() {
  // Always remove all data to have fresh DB
  await Serie.deleteMany({})

  // Then, fetch all root series
  fetchSeries().then(async () => {
    const series = await Serie.find({})
    console.log(series)
  })
}

const fetchSeries = async () => {
  const $ = await rp(rootPage)
  const series = []

  $('div.p-y-5').each((_, el) => {
    const attrs = $(el)
      .find('button')
      .attr()

    // Save IDs and urls in array
    if (attrs !== undefined) {
      const serieUrl = `${baseSerieUrl}${attrs.series_collect_id}`
      series.push({
        id: attrs.series_collect_id,
        title: attrs.title,
        url: serieUrl,
      })
    }
  })

  await Serie.create(series)
}

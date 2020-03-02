const rp = require('request-promise')
const cheerio = require('cheerio')
const moment = require('moment')
const rootPage = {
  uri:
    'https://www.mdcu-comics.fr/includes/comics/inc_select_collection_vf.php?collection_id=469',
  transform(body) {
    return cheerio.load(body)
  },
}
const baseSerieUrl =
  'https://www.mdcu-comics.fr/includes/comics/inc_liste_comics_vf.php?series_collect_id='

const { Serie, Volume } = require('./db/Serie')
const connection = require('./db/connection')

connection.on('open', initParser)

// Set moment locale
moment.locale('fr')

async function initParser() {
  // Always remove all data to have fresh DB
  await Volume.deleteMany({})
  await Serie.deleteMany({})

  // Then, fetch all root series
  await fetchSeries()
    .then(async () => {
      const series = await Serie.find({})
      return series
    })
    .then(async (series) => {
      series.forEach(async (serie) => {
        const volumes = await fetchVolumes(serie)
        serie.volumes = volumes
        serie.save().catch((err) => {
          console.log(err)
        })
      })
    })
    .catch((err) => {
      console.log(err)
    })

  console.log('All done !')
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

const fetchVolumes = async (serie) => {
  const $ = await rp({
    uri: serie.url,
    transform(body) {
      return cheerio.load(body)
    },
  })

  const booksUrls = []
  const volumes = []
  $('div.col-4 > div > div:nth-child(2) > a').each((_, volume) => {
    booksUrls.push($(volume).attr().href)
  })

  // Ici parcourir les booksUrl pour fetch le volume, créer le volume avec les infos + update la serie
  booksUrls.forEach((bookUrl) => {
    volumes.push(fetchVolume(bookUrl))
  })

  return Promise.all(volumes)
}

const fetchVolume = async (volumeUrl) => {
  const $ = await rp({
    uri: volumeUrl,
    transform(body) {
      return cheerio.load(body)
    },
  })

  const title = $('.widget-item > h4:nth-child(1)').text()
  // @TODO Transformer la date en format date mongo
  const formatedDate = $('.meta')
    .text()
    .replace('Sortie le ', '')
    .replace('Aout', 'Août')

  const date = moment(formatedDate, 'dddd DD MMMM YYYY').toDate()

  return {
    date,
    title,
  }
}

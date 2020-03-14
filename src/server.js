var restify = require('restify')
const { Serie, Volume } = require('./db/Serie')
const connection = require('./db/connection')

const server = restify.createServer({
  name: 'comics',
  version: '1.0.0',
})

server.use(restify.plugins.acceptParser(server.acceptable))
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())
server.use(function crossOrigin(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  return next()
})

server.get('/', async (req, res, next) => {
  // const series = await Serie.find().sort({ 'volumes.date': 1 })
  const volumes = await Serie.aggregate([
    {
      $unwind: '$volumes',
    },
    {
      $sort: {
        'volumes.date': 1,
      },
    },
    {
      $project: {
        title: '$volumes.title',
        date: '$volumes.date',
      },
    },
  ])

  res.send(volumes)
  return next()
})

const initServer = () => {
  server.listen(3000, function() {
    console.log('%s listening at %s', server.name, server.url)
  })
}

connection.on('open', initServer)

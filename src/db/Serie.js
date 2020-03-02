const mongoose = require('mongoose')

const connection = require('./connection')

const volumesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String },
  date: { type: Date, default: Date.now, required: true },
})

const serieSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  volumes: [volumesSchema],
})

serieSchema.index({
  title: 'text',
})

const Serie = connection.model('Serie', serieSchema)
const Volume = connection.model('Volume', volumesSchema)

module.exports = { Serie, Volume }

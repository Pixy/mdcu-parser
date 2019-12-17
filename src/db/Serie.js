const mongoose = require('mongoose')

const connection = require('./connection')

const serieSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  volumes: [
    {
      title: { type: String, required: true },
      url: { type: String },
      date: { type: Date, default: Date.now, required: true },
    },
  ],
})

serieSchema.index({
  title: 'text',
})

const Serie = connection.model('Serie', serieSchema)

module.exports = Serie

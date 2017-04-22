const {store} = require('./elasticsearch')
const amqp = require('fluent-amqp')
const host = process.env.RABBITMQ__HOST || 'amqp://localhost'
const ex = 'logs'
const exchangeType = 'fanout'
const q = 'logger'
const durable = true

process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'warn'

amqp(host)
  .exchange(ex, exchangeType, {durable})
  .queue(q)
  .subscribe()
  .errors(err => {
    store({
      source: 'logger',
      level: 'error',
      message: err.message,
      error: err
    })
  })
  .each(msg => store(msg.json()))

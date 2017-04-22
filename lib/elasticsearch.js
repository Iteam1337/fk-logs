const { Client } = require('elasticsearch')

const client = new Client({
  host: process.env.ELASTICSEARCH__HOST || 'http://localhost:9200',
  retryCount: 100,
  requestTimeout: 60000
})
const mapping = {
  index: 'logs',
  body: {
    mappings: {
      event: {
        properties: {
          source: {
            type: 'keyword'
          },
          level: {
            type: 'keyword'
          },
          message: {
            type: 'text'
          }
        }
      }
    }
  }
}

let putIndiciesPromise

function putIndicies () {
  if (!putIndiciesPromise) {
    putIndiciesPromise = client
      .indices
      .create(mapping)
      .catch(err => {
        const rxIndexExists = /^\[index_already_exists_exception\]/i
        if (!rxIndexExists.test(err.toString())) {
          putIndiciesPromise = null
          console.error(err)
          return Promise.reject(err)
        }
      })
  }
  return putIndiciesPromise
}

function store (msg) {
  msg.level = msg.level || ((msg.error) ? 'error' : 'info')
  const doc = {
    index: 'logs',
    type: 'event',
    timestamp: msg.timestamp || new Date(),
    body: msg
  }
  return putIndicies()
    .then(() => client.index(doc))
}

module.exports = {store}
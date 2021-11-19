import { createAPI, server } from 'create-api'

const api = createAPI({
  version: '/v0',
  config: {
    databaseURL: 'https://hacker-news.firebaseio.com'
  }
})

const debug = api.onServer && !!process.env.DEBUG_API

if (api.onServer) {
  warmCache()
}

function warmCache() {
  fetchItems((api.cachedIds.top || []).slice(0, 30))
  setTimeout(warmCache, 1000 * 60 * 15)
}

function fetch(child) {
  debug && console.log(`fetching ${child}...`)
  const cache = api.cachedItems

  if (cache && cache.has(child)) {
    debug && console.log(`cache hit ${child}.`)
    return Promise.resolve(cache.get(child))
  }
  return new Promise((resolve, reject) => {
    server.get(child).then(res => {
      const val = res.data
      if (val) val.__lastUpdated = Date.now()
      cache && cache.set(child, val)
      debug && console.log(`fetched ${child}.`)
      resolve(val)
    }).catch(reject)
  })
}

export function fetchIdsByType(type) {
  return api.cachedIds && api.cachedIds[type]
    ? Promise.resolve(api.cachedIds[type])
    : fetch(`${type}stores`)
}

export function fetchItem(id) {
  return fetch(`items/${id}`)
}

export function fetchItems(ids) {
  return Promise.all(ids.map(id => fetchItem(id)))
}

export function fetchUser(id) {
  return fetch(`users/${id}`)
}

export function watchList(type, cb) {
  let first = true
  const handler = snapshot => {
    if (first)  {
      first = false
    } else {
      cb(snapshot.val())
    }
  }
  return () => {
  }
}
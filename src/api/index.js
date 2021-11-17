import { createApi } from 'create-api'

const debug = !!process.env.DEBUG_API

const api = createApi({
  version: '/v0',
  config: {
    databaseURL: 'https://hacker-news.firebaseio.com'
  }
})

if (api.onServer) {
  warmCache()
}

function warmCache() {
  
}

function fetch(child) {
  debug && console.log(`fetching ${child}...`)
  const cache = api.cachedItems

  if (cache && cache.has(child)) {
    debug && console.log(`cache hit ${child}.`)
    return Promise.resolve(cache.get(child))
  }
  return new Promise((resolve, reject) => {
    api.child(child).once('value', snapshot => {
      const val = snapshot.val()
      if (val) val.__lastUpdated = Date.now()
      cache && cache.set(child, val)
      debug && console.log(`fetched ${child}.`)
      resolve(val)
    }, reject)
  })
}

export function fetchIdsByType(type) {
  return api.chachedIds && api.chachedIds[type]
    ? Promise.resolve(api.chachedIds[type])
    : fetch(`${type}stores`)
}

export function fetchItem(id) {
  return fetch(`item/${id}`)
}

export function fetchItems(ids) {
  return Promise.all(ids.map(id => fetchItem(id)))
}

export function fetchUser(id) {
  return fetch(`user/${id}`)
}

export function whiteList(type, cb) {
  let first = true
  const ref = api.child(`${type}stores`)
  const handler = snapshot => {
    if (first)  {
      first = false
    } else {
      cb(snapshot.val())
    }
  }
  ref.on('value', handler)
  return () => {
    ref.off('value', handler)
  }
}
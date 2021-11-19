// import { initializeApp } from 'firebase/app'
// import { getDatabase, ref, onValue } from 'firebase/database'
import LRU from 'lru-cache'

import { createServer } from './request'

const ss = createServer('http://localhost:3000/')

export const server = ss

// export const Ref = ref
// export const OnValue = onValue

export function createAPI({ config, version }) {
  let api

  if (process.__API__) {
    api = process.__API__
  } else {
    // const app = initializeApp(config)
    // api = process.__API__ = getDatabase(app)
    api = {}

    api.onServer = true

    api.cacheItems = new LRU({
      max: 1000,
      maxAge: 1000 * 60 * 15
    })

    api.cachedIds = {}
    ;['top', 'new', 'show', 'ask', 'job'].forEach(type => {
      // const dbRef = ref(api, `${version}/${type}stories`)
      // onValue(dbRef, snapshot => {
      //   console.log('snapshot', snapshot)
      //   api.cachedIds[type] = snapshot.val()
      // })
      server.get(`/${type}stories`).then(res => {
        console.log('res', res.data)
        api.cachedIds[type] = res.data
      })
    })
  }

  return api
}

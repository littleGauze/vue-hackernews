import Firebase from 'firebase'
import LRU from 'lru-cache'

export function creatAPI({ config, version }) {
  let api

  if (process.__API__) {
    api = process.__API__
  } else {
    Firebase.initializeApp(config)
    api = process.__API__ = Firebase.database().ref(version)

    api.onServer = true

    api.cacheItems = new LRU({
      max: 1000,
      maxAge: 1000 * 60 * 15
    })

    api.cachedIds = {}
    ;['top', 'new', 'show', 'ask', 'job'].forEach(type => {
      api.child(`${type}stores`).on('value', snapshot => {
        api.cachedIds[type] = snapshot.val()
      })
    })
  }

  return api
}

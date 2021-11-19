const { initializeApp } = require('firebase/app')
const { getDatabase, ref, onValue, child } = require('firebase/database')

const version = "/v0"
const config = {
  databaseURL: 'https://hacker-news.firebaseio.com'
}

const app = initializeApp(config)
const db = getDatabase(app)

const v0Ref = ref(db, version)

onValue(child(v0Ref, 'topstories'), snapshot => {
  console.log('snaphost ', snapshot)
  console.log('snaphost val ', snapshot.val())
})

setInterval(() => {}, 1000);

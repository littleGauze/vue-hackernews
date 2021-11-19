// import { initializeApp } from 'firebase/app'
// import { getDatabase, ref, onValue } from 'firebase/database'

// export const Ref = ref
// export const OnValue = onValue


// export function createAPI({ config, version }) {
//   const app = initializeApp(config)
//   return getDatabase(app)
// }

import { createServer } from './request'

const ss = createServer('http://localhost:8080/')

export const server = ss

export function createAPI() {
  return {}
}

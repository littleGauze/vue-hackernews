import {
  fetchUser,
  fetchItems,
  fetchIdsByType
} from '../api'

export default {
  FETCH_LIST_DATA({ commit, dispatch }, { type }) {
    commit('SET_ACTIVE_TYPE', { type })
    console.log('fetch list data ', type)
    return fetchIdsByType(type) 
      .then(ids => commit('SET_LIST', { type, ids }))
      .then(() => dispatch('ENSURE_ACTIVE_ITEMS'))
  },

  ENSURE_ACTIVE_ITEMS({ dispatch, getters }) {
    return dispatch('FETCH_ITEMS', { ids: getters.activeIds })
  },

  FETCH_ITEMS({ commit, state }, { ids }) {
    const now = Date.now()
    ids = ids.filter(id => {
      const item = state.items[id]
      if (!item) return true
      if (now - item._lastUpdated > 1000 * 60 * 3) return true
      return false
    })
    if (ids.length) {
      return fetchItems(ids).then(items => commit('SET_ITEMS', { items }))
    } else {
      return Promise.resolve()
    }
  },

  FETCH_USER({ commit, state }, { id }) {
    return state.users[id]  
      ? Promise.resolve(state.users[id])
      : fetchUser(id).then(user => commit('SET_USER', { id, user }))
  }
}

<template>
  <div class="item-view" v-if="item">
    <template v-if="item">
      <div class="item-view-header">
        <a :href="item.url" target="_blank">
          <h1>{{ item.title }}</h1>
        </a>
        <span v-if="item.url" class="host">
          ({{ item.url | host }})
        </span>
        <p class="meta">
          {{ it.score }} points
          | by <router-link :to="'/user/' + item.by">{{ item.by }}</router-link>
          {{ item.time | timeAgo }} ago
        </p>
      </div>
      <div class="item-view-comments">
        <p class="item-view-comments-header">
          {{ item.kids ?  item.descendants + ' comments' : 'No comment yet.' }}
          <spinner :show="loading"/>
        </p>
        <ul v-if="!loading" class="comment-children">
          <comment v-for="id in item.kids" :key="id" :id="id"/>
        </ul>
      </div>
    </template>
  </div>
</template>
<script>
import Comment from '../components/Comment.vue'
import Spinner from '../components/Spinner.vue'

export default {
  name: 'item-view',
  components: { Comment, Spinner },
  data () {
    return {
      loading: false
    }
  },
  computed: {
    item() {
      return this.$store.state.items[this.$route.params.id]
    }
  },
  asyncData({ store, route: { params: { id } } }) {
    return store.dispatch('FETCH_ITEMS', { ids: [id] })
  },
  title() {
    return this.item.title
  },
  beforeMount() {
    this.fetchItems()
  },
  methods: {
    fetchItems() {
      if (!this.item || !this.item.kids) return

      this.loading = true
      fetchComments(this.$store, this.item).then(() => {
        this.loading = false
      })
    }
  }
}

function fetchComments(store, item) {
  if (item && item.kids) {
    return store.dispatch('FETCH_ITEMS', { ids: item.kids })
      .then(() => Promise.all(item.kids.map(id => {
        return fetchItems(store, store.state.items[id])
      })))
  }
}
</script>
<style lang="stylus">
.item-view-header {

}
</style>
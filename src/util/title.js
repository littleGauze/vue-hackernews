function getTitle(vm) {
  const { title } = vm.$options
  if (title) {
    return typeof title === 'function'
      ? title.call(vm)
      : title
  }
}

const serverTitleMixin = {
  created() {
    const title = getTitle(this)
    if (title) {
      this.$ssrContext.title = `Vue HN2.0 | ${title}`
    }
  }
}

const clientTitleMixin = {
  mounted() {
    const title = getTitle(this)
    if (title) {
      document.title = `Vue HN2.0 | ${title}`
    }
  }
}

const isServer = process.env.VUE_ENV === 'server'

export default isServer ? serverTitleMixin : clientTitleMixin

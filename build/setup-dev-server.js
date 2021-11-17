const fs = require('fs')
const path = require('path')
const MFS = require('memory-fs')
const webpack = require('webpack')
const chokidar = require('chokidar')
const clientConfig = require('../build/webpack.client.config')
const serverConfig = require('../build/webpack.server.config')

const readFile = (fs, file) => {
  try {
    return fs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8')
  } catch (err) {}
}

module.exports = function setupDevServer(app, templatePath, cb) {
  let bundle
  let template
  let clientManifest

  let ready
  const readyPromise = new Promise(r => { ready = r })
  const update = () => {
    ready()
    cb(bundle, {
      template,
      clientManifest
    })
  }

  template = fs.readFileSync(templatePath, 'utf-8')
  chokidar.watch(templatePath).on('change', () => {
    template = fs.readFileSync(templatePath, 'utf-8')
    console.log('index.html template updated')
    update()
  })

  clientConfig.entry.app = ['webpack-hot-middleware/client', clientConfig.entry.app]
  clientConfig.output.filename = '[name].js'
  clientConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  )

  const clientCompiler = webpack(clientConfig)
  const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
    publicPath: clientConfig.output.publicPath
  })
  app.use(devMiddleware)
  clientCompiler.hooks.done.tap('BuildStatsPlugin', stats => {
    stats.errors = stats.errors || []
    stats.warnings = stats.warnings || []
    stats.errors.forEach(err => console.error(err))
    stats.warnings.forEach(err => console.warn(err))
    if (stats.errors.length) return
    const manifest = readFile(
      clientCompiler.outputFileSystem,
      'vue-ssr-client-manifest.json'
    )
    clientManifest = JSON.parse(manifest)
    update()
  })

  app.use(require('webpack-hot-middleware')(clientCompiler, { hearbeat: 5000 }))

  const serverComplier = webpack(serverConfig)
  const mfs = new MFS()
  serverComplier.outputFileSystem = mfs
  serverComplier.watch({}, (err, stats) => {
    if (err) throw err
    if (stats.errors && stats.errors.length) return

    bundle = JSON.parse(readFile(mfs, 'vue-ssr-server-bundle.json'))
    update()
  })

  return readyPromise
}

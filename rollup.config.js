const sourceMaps = require('rollup-plugin-sourcemaps')
const typescript = require('rollup-plugin-typescript2')
const camelCase = require('lodash.camelcase')
const { terser } = require('rollup-plugin-terser')

const pkg = require('./package.json')

const entryName = 'get-selection-more'

function baseConfig() {
  return {
    input: `src/${entryName}.ts`,
    output: [],
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: [],
    watch: {
      include: 'src/**'
    },
    plugins: [
      // Resolve source maps to the original source
      sourceMaps(),
      // Minify
      terser()
    ]
  }
}

function esConfig() {
  const config = baseConfig()
  config.output = [{ file: pkg.module, format: 'es', sourcemap: true }]
  config.plugins.unshift(typescript({ useTsconfigDeclarationDir: true }))
  return config
}

function umdConfig() {
  const config = baseConfig()
  config.output = [{ file: pkg.main, name: camelCase(entryName), format: 'umd', sourcemap: true }]
  config.plugins.unshift(
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          target: 'es5'
        }
      },
      useTsconfigDeclarationDir: true
    })
  )
  return config
}

module.exports = [esConfig(), umdConfig()]

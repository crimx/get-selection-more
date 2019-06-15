const path = require('path')

module.exports = config => {
  config.set({
    files: ['test/index.ts'],

    singleRun: !!process.env.CI,

    frameworks: ['mocha', 'chai'],

    preprocessors: {
      'test/index.ts': ['webpack']
    },

    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },

    browsers: ['Chrome'],

    reporters: ['nyan', 'coverage-istanbul'],

    webpackMiddleware: {
      noInfo: true,
      stats: 'errors-only'
    },
    webpack: {
      mode: 'development',
      entry: './src/get-selection-more.ts',
      output: {
        filename: '[name].js'
      },
      devtool: 'inline-source-map',
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: {
              loader: 'ts-loader',
              options: {
                configFile: 'test/tsconfig.json'
              }
            },
            exclude: [path.join(__dirname, 'node_modules')]
          },
          {
            test: /\.tsx?$/,
            include: [path.join(__dirname, 'src')],
            enforce: 'post',
            use: {
              loader: 'istanbul-instrumenter-loader',
              options: { esModules: true }
            }
          }
        ]
      },
      resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json']
      }
    },

    coverageIstanbulReporter: {
      reports: ['html', 'text-summary'],
      dir: path.join(__dirname, 'coverage'),
      fixWebpackSourcePaths: true,
      'report-config': {
        html: { outdir: 'html' }
      }
    },

    nyanReporter: {
      renderOnRunCompleteOnly: !process.env.CI
    }
  })
}

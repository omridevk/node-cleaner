[![Build Status](https://travis-ci.org/omridevk/node-cleaner.svg?branch=master)](https://travis-ci.org/omridevk/node-cleaner)

## Starting Development

Start the app in the `dev` environment. This starts the renderer process in [**hot-module-replacement**](https://webpack.js.org/guides/hmr-react/) mode and starts a webpack dev server that sends hot updates to the renderer process:

```bash
yarn dev
```

#### Demo mode

start the app in the development mode but all deletetion of directories will be mocked (i.e node_modules directory will not be deleted).
Good for testing functionality without actually deleting files from the file system.

```bash
yarn dev-demo
```

## Packaging for Production

To package apps for the local platform:

```bash
yarn package
```

## Publishing

1. Development should happen on sidebranch
2. Increase version in both package.json app/package.json
3. When feature is ready merge to master
4. This will trigger Travis CI 
5. Travis will publish to S3 and create GitHub draft


## Docs

See our [docs and guides here](https://electron-react-boilerplate.js.org/docs/installation)

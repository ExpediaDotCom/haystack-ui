
[![Build Status](https://travis-ci.org/ExpediaDotCom/haystack-ui.svg?branch=master)](https://travis-ci.org/ExpediaDotCom/haystack-ui)
[![Coverage Status](https://coveralls.io/repos/github/ExpediaDotCom/haystack-ui/badge.svg?branch=code-coverage)](https://coveralls.io/github/ExpediaDotCom/haystack-ui?branch=code-coverage)

<img src="/public/images/assets/logo_with_title_transparent.png" width="300" />

# haystack-ui
Haystack-ui is the web UI for haystack. It is the central place for visualizing processed data from various haystack sub-systems. 
Visualization tools in haystack-ui include -
* **Traces** - Distributed tracing visualization for easy root cause analysis 
* **Trends** - Trends visualizing for vital service trends 
* **Service Dependency** [coming soon] - Real time dependency graph with health and connectivity indicators 
* **Alerts and Anomaly detection** [coming soon] - UI for configuring and subscribing alerts 

Haystack-ui's navigation is pivoted around services. On selecting a service, you will get various visualizations tools each corresponding to a haystack sub-systems.


## Development
It is a expressjs based single page client side app written in ES6 + React and using Mobx for data flow. 

### Pre-requisites
Ensure you have `node >= 8.6` and `npm >= 5.3` installed.

### Build and Run
This application uses [webpack](https://webpack.github.io/) as the UI module bundler. To build + bundle all the required UI assets (CSS/JS) and run expressjs server, use:

```
$ npm install                # install dependencies
$ npm run start:dev          # start server in hot-reload server side 
```

Once start is successful you can visit [http://localhost:8080/](http://localhost:8080/)

To continuously re-build the assets while you are developing, use this command in a separate terminal:

```
$ npm run watch
```

## Testing

Haystack-ui utilizes [Mocha](https://github.com/mochajs/mocha) as it's testing framework, with [Chai](https://github.com/chaijs/chai) as the assertation library, [Enzyme](https://github.com/airbnb/enzyme) for utility, and [JSDOM](https://github.com/tmpvar/jsdom) as a headless browser for rendering React components.
[ESLint](https://github.com/eslint/eslint) is used as a linter and insurance of code quality. 

To run the test suite, enter the command ```npm test```.

To check code coverage, run ```npm run coverage``` and open the generated index.html in the created coverage folder

**Note**-
You may have to install Cairo dependencies separately for tests to work.
- **OS X Users** : `brew install pkg-config cairo pango libpng jpeg giflib`
- **Others**: Refer [https://www.npmjs.com/package/canvas#installation](https://www.npmjs.com/package/canvas#installation)


### Docker 
We have provided `make` commands to facilitate building. For creating docker image use -
```
$ make all 

```

## Configuration
Haystack UI can be configured to use one or more stores, each providing user interface for one subsystem in Haystack. Based on what subsystems you have available in your haystack cluster, you can configure corresponding stores and UI will adapt to show interfaces only for the configured subsystems. 
For more details on this refer - [https://github.com/ExpediaDotCom/haystack-ui/wiki/Configuring-Subsystem-Stores](https://github.com/ExpediaDotCom/haystack-ui/wiki/Configuring-Subsystem-Stores)

## Haystack-ui as drop-in replacement for Zipkin UI
If you have an existing zipkin cluster you can use haystack UI as a drop-in replacement for zipkin's UI.
For more details on this refer - [https://github.com/ExpediaDotCom/haystack-ui/wiki/Configuring-Subsystem-Stores#zipkin-store](https://github.com/ExpediaDotCom/haystack-ui/wiki/Configuring-Subsystem-Stores#zipkin-store)

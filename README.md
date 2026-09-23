# BetterDiscordPlugins

## Table of Contents

- [Installation](#installation)
- [Plugin Structure](#plugin-structure)
- [Usage](#usage)


## Installation

clone or download repo then:
```sh
npm install 
```
---

## Plugin Structure

An entry point `index.(js/jsx)` and config file `config.json` are **required**.

*these files can be auto generated `npm run new`* 


```
pluginsFolder
    └── src/
        └── SomePlugin
            ├── config.json
            └── index.js
```
**Note**: `pluginsFolder` defined in `builder.json`

#### `config.json` 

```json
{
  "info": {
    "name": "",
    "version": "",
    "description": "",
    "source": "",
    "github": "",
  },
  "settings": {},
  "changelog": [{
    "type":"",
    "items":[]
  }]
}
```

#### `index.js` 

```js
module.exports = () => {
    start(){}
    stop(){}
};
```

--- 

## Usage 

Building target plugin
```sh
npm run build [pluginName]

# build in watch mode 
npm run build:w [pluginName]
```
**Note**: `[pluginName]` must match folder name 


Build all plugins
```sh
npm run build:a
```
**Note**: alternatively you can navigate to the plugin folder and run the same commands ommiting `[pluginName]`

---

### Dev builds

Building target plugin
```sh
npm run dev [pluginName]

# dev in watch mode 
npm run dev:w [pluginName]
```
**Note**: `[pluginName]` must match folder name 

Build all plugins
```sh
npm run dev:a
```
 

## Difference between `build` and `dev` commands

**build**: builds for production at `releaseFolder` defined in `builder.json` and clears debugging `DEV` labels  
**dev**: builds at BetterDiscord plugins folder

---

Create a new plugin template
```npm
npm run new [intended plugin name]
```

To lint, navigate to anywhere within builder project folder 
```
npm run lint
```
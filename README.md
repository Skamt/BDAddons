# BetterDiscordPlugins


## build

navigate to the plugin folder then run:
```
npm run build
```
building all plugins at once 
```
npm run build all
```

to create a new plugin template
```npm
npm run new <intended plugin name>
```
To lint, navigate to that plugin folder then run:
```
npm run lint
```
---

Plugin folder must have at least `config.json` and `index.(js/jsx)` files, these files can be auto generated using `new` command

## config template

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
*Note: take a look at `buildConfig` in package.json*
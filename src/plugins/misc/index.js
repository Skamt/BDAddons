const {
	UI,
	DOM,
	Patcher,
	Webpack: {
		Filters,
		getModule
	}
} = new BdApi(config.info.name);
const electron = require('electron');
module.exports = () => ({ start() {DOM.addStyle(require("styles.css"))}, stop() { DOM.removeStyle() } });


// Patcher.after(MODULE, "FUNCNAME", (_, args, returnValue) => {
// 	console.log(args, returnValue);
// });


const nativeModules = getModule((m, e, i) => m.default.setObservedGamesCallback);
nativeModules.default = { ...nativeModules.default, setObservedGamesCallback: () => {} };


let i = setInterval(() => {
	const host = document.querySelector("#app-mount > div > div");
	if (!host || document.querySelector('#console')) return;
	clearInterval(i);
	const el = document.createElement('span');
	el.id = 'console';

	el.textContent = 'open Console';
	el.onclick = () => electron.ipcRenderer.send('bd-toggle-devtools');

	host.append(el);
}, 2000);



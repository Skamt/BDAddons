const { UI, DOM, Patcher, ContextMenu, Webpack: { Filters, getModule } } = new BdApi(config.info.name);
const electron = require('electron');

/* Stop discord monitoring running games */
const nativeModules = getModule((m, e, i) => m.default.setObservedGamesCallback);
nativeModules.default = { ...nativeModules.default, setObservedGamesCallback: () => {} };
/* END Stop discord monitoring running games */

/* Spotify Listen Along */
const DeviceStore = BdApi.Webpack.getModule(m => m?.getActiveSocketAndDevice);

function patchDeviceStore() {
	if (DeviceStore?.getActiveSocketAndDevice) {
		Patcher.after(
			DeviceStore,
			'getActiveSocketAndDevice',
			(_, args, ret) => {
				if (ret?.socket) ret.socket.isPremium = true;
				return ret;
			}
		);
	}
}
/* END Spotify Listen Along */

/* Console toggle button */
let i = setInterval(() => {
	const host = document.querySelector("#app-mount > div > div");
	if (!host) return;
	clearInterval(i);
	const el = document.createElement('span');
	el.id = 'console';

	el.textContent = 'F12';
	el.onclick = () => electron.ipcRenderer.send('bd-toggle-devtools');

	host.append(el);
}, 2000);
/* END console toggle button */

module.exports = () => ({
	start() {
		DOM.addStyle(require("styles.css"));
		patchDeviceStore();
	},
	stop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
		document.querySelector('#console').parentElement.removeChild(document.querySelector('#console'));
	}
});
import { ContextMenu } from "@Api";
import electron from "electron";
import { insertChild } from "@React";

module.exports = () => ({
	stop() {},
	start() {
		this.stop = ContextMenu.patch("settings-menu", ret => {
			const MenuItem = BdApi.ContextMenu.buildItem({
				label: "Open Console",
				action() {
					electron.ipcRenderer.send("bd-toggle-devtools");
				}
			});

			insertChild(ret, MenuItem);
		});
	}
});

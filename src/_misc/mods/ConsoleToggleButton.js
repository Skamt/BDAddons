import { sleep } from "@Utils";
import electron from "electron";

export default class ConsoleToggleButton {
	constructor() {
		this.buildF12Button();
	}

	buildF12Button() {
		this.el = document.createElement("span");
		this.el.id = "console";
		this.el.textContent = "F12";
		this.el.onclick = () => electron.ipcRenderer.send("bd-toggle-devtools");
	}

	async addButtonConsoleButton() {
		while (true) {
			this.host = document.querySelector("#app-mount > div > div");
			if (!this.host) {
				await sleep(2);
				continue;
			}
			this.host.append(this.el);
			this.addButtonConsoleButton = () => this.host.append(this.el);
			break;
		}
	}

	Init() {
		this.addButtonConsoleButton();
	}

	Dispose() {
		this.el.remove();
	}
}
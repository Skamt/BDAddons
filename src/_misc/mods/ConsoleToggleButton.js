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

	addButtonConsoleButton() {
		document.body.append(this.el);
	}

	Init() {
		this.addButtonConsoleButton();
	}

	Dispose() {
		this.el.remove();
	}
}

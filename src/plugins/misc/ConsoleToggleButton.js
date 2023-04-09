new class ConsoleToggleButton extends Disposable {
	constructor() {
		super();
		this.buildF12Button();
		this.first = true;
	}

	sleep(delay) {
		return new Promise(resolve => { setTimeout(() => { resolve(); }, delay * 1000); });
	}

	async addButtonConsoleButton() {
		// eslint-disable-next-line no-constant-condition
		while (true) {
			this.host = document.querySelector("#app-mount > div > div");
			if (!this.host) {
				await this.sleep(2);
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
	buildF12Button() {
		this.el = document.createElement("span");
		this.el.id = "console";
		this.el.textContent = "F12";
		this.el.onclick = () => electron.ipcRenderer.send("bd-toggle-devtools");
	}

	Dispose() {
		this.host.removeChild(this.el);
	}
}
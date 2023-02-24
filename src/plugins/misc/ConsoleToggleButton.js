new class ConsoleToggleButton extends Disposable {
	constructor(){
		super();
		this.buildF12Button();
		this.first = true;
	}

	sleep(delay) {
		return new Promise(resolve => { setTimeout(() => { resolve() }, delay * 1000) });
	}

	async Init() {
		if (this.first) {
			while (true) {
				await this.sleep(2);
				this.host = document.querySelector("#app-mount > div > div");
				if (!this.host) continue;
				this.host.append(this.el);
				this.first = false;
				break;
			}
		} else {
			this.host.append(this.el);
		}
	}

	buildF12Button() {
		this.el = document.createElement('span');
		this.el.id = 'console';
		this.el.textContent = 'F12';
		this.el.onclick = () => electron.ipcRenderer.send('bd-toggle-devtools');
	}

	Dispose() {
		this.host.removeChild(this.el);
	}
}
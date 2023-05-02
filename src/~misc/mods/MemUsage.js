import { sleep, prettyfiyBytes } from "@Utils";

import DiscordUtils from "@Modules/DiscordUtils";

export default class MemUsage {
	constructor() {
		this.buildF12Button();
	}

	buildF12Button() {
		this.el = document.createElement("b");
		this.el.id = "memUsage";
		this.el.textContent = "0";
	}

	async Init() {
		while (true) {
			this.host = document.querySelector("#app-mount > div > div");
			if (!this.host) {
				await sleep(2);
				continue;
			}
			this.host.append(this.el);
			this.interval = setInterval(() => {
				this.el.textContent = `${prettyfiyBytes(process.memoryUsage().rss, true, 3)} | CPU: ${process.getCPUUsage().percentCPUUsage.toFixed(2)}%`;
			}, 500);
			break;
		}
	}

	Dispose() {
		clearInterval(this.interval);
		this.el.remove();
	}
}
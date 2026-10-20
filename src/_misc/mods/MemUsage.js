import { sleep  } from "@Utils";

function prettyfiyBytes(bytes, si = false, dp = 1) {
	const thresh = si ? 1000 : 1024;

	if (Math.abs(bytes) < thresh) {
		return `${bytes} B`;
	}

	const units = si ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"] : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
	let u = -1;
	const r = 10 ** dp;

	do {
		bytes /= thresh;
		++u;
	} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

	return `${bytes.toFixed(dp)} ${units[u]}`;
}
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
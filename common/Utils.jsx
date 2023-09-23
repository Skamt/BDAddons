import { React } from "@Api";
import { Patcher, getOwnerInstance } from "@Api";
import ImageModal from "@Modules/ImageModal";
import ModalRoot from "@Modules/ModalRoot";
import RenderLinkComponent from "@Modules/RenderLinkComponent";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import ErrorBoundary from "@Components/ErrorBoundary";


export const openModal = children => {
	TheBigBoyBundle.openModal(props => {
		return (
			<ErrorBoundary
				id="modal"
				plugin={config.info.name}>
				<ModalRoot
					{...props}
					className="modal-3Crloo">
					{children}
				</ModalRoot>
			</ErrorBoundary>
		);
	});
};

export const getImageModalComponent = (url, rest) => (
	<ImageModal
		{...rest}
		src={url}
		original={url}
		renderLinkComponent={p => <RenderLinkComponent {...p} />}
	/>
);

export const promiseHandler = promise => promise.then(data => [, data]).catch(err => [err]);

export function copy(data) {
	DiscordNative.clipboard.copy(data);
}

export function getNestedProp(obj, path) {
	return path.split(".").reduce(function (ob, prop) {
		return ob && ob[prop];
	}, obj);
}

export class BrokenAddon {
	stop() {}
	start() {
		BdApi.alert(config.info.name, "Plugin is broken, Notify the dev.");
	}
}

export class MissingZlibAddon {
	stop() {}
	start() {
		BdApi.alert("Missing library", [`**ZeresPluginLibrary** is needed to run **${config.info.name}**.`, "Please download it from the officiel website", "https://betterdiscord.app/plugin/ZeresPluginLibrary"]);
	}
}

export class Disposable {
	constructor() {
		this.patches = [];
	}

	Dispose() {
		this.patches?.forEach(p => p?.());
		this.patches = [];
	}
}

export function reRender(selector) {
	const target = document.querySelector(selector)?.parentElement;
	if (!target) return;
	const instance = getOwnerInstance(target);
	const unpatch = Patcher.instead(instance, "render", () => unpatch());
	instance.forceUpdate(() => instance.forceUpdate());
}

export const nop = () => {};

export function sleep(delay) {
	return new Promise(done => setTimeout(() => done(), delay * 1000));
}

export function prettyfiyBytes(bytes, si = false, dp = 1) {
	const thresh = si ? 1000 : 1024;

	if (Math.abs(bytes) < thresh) {
		return bytes + " B";
	}

	const units = si ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"] : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
	let u = -1;
	const r = 10 ** dp;

	do {
		bytes /= thresh;
		++u;
	} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

	return bytes.toFixed(dp) + " " + units[u];
}

export function parseSnowflake(snowflake) {
	return snowflake / 4194304 + 1420070400000;
}

export function genUrlParamsFromArray(params) {
	if (typeof params !== "object") throw new Error("params argument must be an object or array");
	if (typeof params === "object" && !Array.isArray(params)) {
		params = Object.entries(params);
	}
	return params.map(([key, val]) => `${key}=${val}`).join("&");
}

export function buildUrl(endpoint, path, params) {
	const uri = endpoint + path;
	if (params) {
		params = genUrlParamsFromArray(params);
		return `${uri}?${params}`;
	}
	return uri;
}

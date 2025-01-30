import "./styles";
import { Patcher, getOwnerInstance, ReactDOM, React } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";
import RenderLinkComponent from "@Modules/RenderLinkComponent";

import ImageModal from "@Modules/ImageModal";
import ModalRoot from "@Modules/ModalRoot";
import ModalSize from "@Modules/ModalSize";
import _openModal from "@Modules/openModal";

// const { ModalRoot, ModalSize } = TheBigBoyBundle;

export function shallow(objA, objB) {
	if (Object.is(objA, objB)) return true;

	if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) return false;

	var keysA = Object.keys(objA);

	if (keysA.length !== Object.keys(objB).length) return false;

	for (var i = 0; i < keysA.length; i++) if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]])) return false;

	return true;
}

export const openModal = (children, tag, modalClassName = "") => {
	const id = `${tag ? `${tag}-` : ""}modal`;

	_openModal(props => {
		return (
			<ErrorBoundary
				id={id}
				plugin={config.info.name}>
				<ModalRoot
					{...props}
					className={`${modalClassName} transparentBackground`}
					onClick={props.onClose}
					size={ModalSize.DYNAMIC}>
					{children}
				</ModalRoot>
			</ErrorBoundary>
		);
	});
};

export const getImageModalComponent = (url, rest = {}) => {
	return (
		<div className="imageModalwrapper">
			<ImageModal
				media={{
					...rest,
					type: "IMAGE",
					url: url,
					proxyUrl: url
				}}
			/>
			<div className="imageModalOptions">
				<RenderLinkComponent
					className="downloadLink"
					href={url}>
					Open in Browser
				</RenderLinkComponent>
			</div>
		</div>
	);
};
export const promiseHandler = promise => promise.then(data => [undefined, data]).catch(err => [err]);

export function copy(data) {
	DiscordNative.clipboard.copy(data);
}

export function getNestedProp(obj, path) {
	return path.split(".").reduce((ob, prop) => ob?.[prop], obj);
}

export class BrokenAddon {
	stop() {}
	start() {
		BdApi.alert(config.info.name, "Plugin is broken, Notify the dev.");
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

export function getImageDimensions(url) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () =>
			resolve({
				width: img.width,
				height: img.height
			});
		img.onerror = reject;
		img.src = url;
	});
}

export function hook(hook, ...args) {
	let v;
	const b = document.createElement("div");
	// eslint-disable-next-line react/no-deprecated
	ReactDOM.render(
		// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
		// biome-ignore lint/style/noCommaOperator: <explanation>
		React.createElement(() => ((v = hook(...args)), null)),
		b
	);
	ReactDOM.unmountComponentAtNode(b);
	return v;
}

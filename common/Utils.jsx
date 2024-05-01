import { Patcher, ReactDOM, React } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";
import RenderLinkComponent from "@Modules/RenderLinkComponent";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
const { ModalRoot, ModalSize } = TheBigBoyBundle;
import ImageModalVideoModal from "@Modules/ImageModalVideoModal";
const ImageModal = ImageModalVideoModal.ImageModal;



export function shallow(objA, objB) {
	if (Object.is(objA, objB)) return true;

	if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) return false;

	var keysA = Object.keys(objA);

	if (keysA.length !== Object.keys(objB).length) return false;

	for (var i = 0; i < keysA.length; i++) if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]])) return false;

	return true;
}

export const openModal = (children, tag, className) => {
	const id = `${tag ? `${tag}-` : ""}modal`;
	TheBigBoyBundle.openModal(props => {
		return (
			<ErrorBoundary
				id={id}
				plugin={config.info.name}>
				<ModalRoot
					{...props}
					className={className}
					onClick={props.onClose}
					size={ModalSize.DYNAMIC}>
					{children}
				</ModalRoot>
			</ErrorBoundary>
		);
	});
};

export const getImageModalComponent = (url, rest = {}) => (
	<ImageModal
		{...rest}
		src={url}
		original={url}
		response={true}
		renderLinkComponent={p => <RenderLinkComponent {...p} />}
	/>
);

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

export const d = () => {
	const cache = new WeakMap();
	const emptyDoc = document.createDocumentFragment();

	function isValidCSSSelector(selector) {
		try {
			emptyDoc.querySelector(selector);
		} catch {
			return false;
		}
		return true;
	}

	function getElement(target) {
		if (typeof target === "string" && isValidCSSSelector(target)) return document.querySelector(target);

		if (target instanceof HTMLElement) return target;

		return undefined;
	}

	function getCssRules(el) {
		const output = {};
		for (let i = 0; i < document.styleSheets.length; i++) {
			const stylesheet = document.styleSheets[i];
			const { rules } = stylesheet;
			const ID = stylesheet.href || stylesheet.ownerNode.id || i;
			output[ID] = {};
			// biome-ignore lint/complexity/noForEach: <explanation>
			el.classList.forEach(c => {
				output[ID][c] = [];
				for (let j = 0; j < rules.length; j++) {
					const rule = rules[j];
					if (rule.cssText.includes(c)) output[ID][c].push(rule);
				}
				if (output[ID][c].length === 0) delete output[ID][c];
			});
			if (Object.keys(output[ID]).length === 0) delete output[ID];
		}
		return output;
	}

	function getCssRulesForElement(target, noCache) {
		const el = getElement(target);

		if (!el) return;

		if (!noCache || cache.has(el)) return cache.get(el);

		const data = getCssRules(el);
		cache.set(el, data);
		return data;
	}

	// get scroller styles for an element
	function scrollerStylesForElement(el) {
		const output = [];
		const styles = getCssRulesForElement(el);
		for (const cssStyleRules of Object.values(styles)) {
			for (const rules of Object.values(cssStyleRules)) {
				for (let i = 0; i < rules.length; i++) {
					const rule = rules[i];
					if (rule.selectorText?.includes("-webkit-scrollbar")) output.push(rule);
				}
			}
		}
		return output;
	}

	return {
		getCssRulesForElement,
		scrollerStylesForElement
	};
};

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
	BdApi.ReactDOM.unmountComponentAtNode(b);
	return v;
}

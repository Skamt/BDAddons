/**
 * @name HideStuff
 * @description let's you pick and hide elements
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/HideStuff
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/HideStuff/HideStuff.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "HideStuff",
		"version": "1.0.0",
		"description": "let's you pick and hide elements",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/HideStuff/HideStuff.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/HideStuff",
		"authors": [{
			"name": "Skamt"
		}]
	}
};

// common/Api.js
var Api = new BdApi(Config_default.info.name);
var DOM = /* @__PURE__ */ (() => Api.DOM)();
var Data = /* @__PURE__ */ (() => Api.Data)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();

// common/Utils/Logger.js
Logger.patchError = (patchId) => {
	console.error(`%c[${Config_default.info.name}] %cCould not find module for %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
};
var Logger_default = Logger;

// common/Utils/EventEmitter.js
var EventEmitter_default = class {
	constructor() {
		this.listeners = {};
	}
	isInValid(event, handler) {
		return typeof event !== "string" || typeof handler !== "function";
	}
	once(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) this.listeners[event] = /* @__PURE__ */ new Set();
		const wrapper = () => {
			handler();
			this.off(event, wrapper);
		};
		this.listeners[event].add(wrapper);
	}
	on(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) this.listeners[event] = /* @__PURE__ */ new Set();
		this.listeners[event].add(handler);
		return () => this.off(event, handler);
	}
	off(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) return;
		this.listeners[event].delete(handler);
		if (this.listeners[event].size !== 0) return;
		delete this.listeners[event];
	}
	emit(event, ...payload) {
		if (!this.listeners[event]) return;
		for (const listener of this.listeners[event]) {
			try {
				listener.apply(null, payload);
			} catch (err) {
				Logger_default.error(`Could not run listener for ${event}`, err);
			}
		}
	}
};

// common/Utils/Plugin.js
var Events = {
	START: "START",
	STOP: "STOP"
};
var Plugin_default = new class extends EventEmitter_default {
	start() {
		this.emit(Events.START);
	}
	stop() {
		this.emit(Events.STOP);
	}
}();

// common/Utils/StylesLoader.js
var styleLoader = {
	_styles: [],
	push(styles) {
		this._styles.push(styles);
	}
};
Plugin_default.on(Events.START, () => {
	DOM.addStyle(styleLoader._styles.join("\n"));
});
Plugin_default.on(Events.STOP, () => {
	DOM.removeStyle();
});
var StylesLoader_default = styleLoader;

// src/HideStuff/styles.css
StylesLoader_default.push(`.ui-picker-container {
	position: fixed;
	inset: 0;
	z-index: 2147483647;
	transform: translate(0);
}

.ui-picker-highlighter {
	position: absolute;
	background: #0003;
	inset: 0;
}
.ui-picker-highlighter svg{
	box-sizing: border-box;
	position: absolute;
	inset:0;
	height:100%;
	width:100%;
}

.ui-picker-marker {
	stroke: #f00;
	stroke-width: 0.5px;
	fill: rgba(255, 63, 63, 0.2);
}



.ui-picker-highlighter.ui-picker-preview {
	opacity: 0;
}

.ui-picker-editor {
	position: absolute;
	bottom: 0;
	right: 0;
	max-height: 60vh;
	height: 500px;
	width: 500px;
	border: 1px solid white;
	display: flex;
	background: #000;
	flex-direction: column;
	padding: 5px;
	gap: 5px;
}

.ui-picker-editor * {
	/*margin: 2px;*/
}

.ui-picker-header {
	display: flex;
	gap: 5px;
	flex: 0 0 30px;
}

.ui-picker-drag-handle {
	border: 1px solid white;
	flex: 1 0 0;
	background:
		radial-gradient(circle at center, #fff 1px, #0000 1px) -1px -1px/ 4px 4px,
		radial-gradient(circle at center, #fff 1px, #0000 1px) 1px 1px/ 4px 4px;
}

.ui-picker-close {
	background: orange;
	aspect-ratio: 1;
}

.ui-picker-content {
	flex: 1 0 0;
	display: flex;
	flex-direction: column;
	gap: 5px;
}

.ui-picker-textarea {
	flex: 1 0 0;
	min-height: 0;
	resize: none;
}

.ui-picker-controls {
	flex: 0 0 auto;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.ui-picker-buttons {
	display: flex;
}

.ui-picker-pick {
}
.ui-picker-preview {
}
.ui-picker-create {
	margin-left: auto;
}
.ui-picker-candidates {
	flex: 2 0 0;
	min-height: 0;
	padding: 5px;
	display: flex;
	flex-direction: column;
	overflow: auto;
	color: white;
	background: #000;
	font-family: monospace;
	font-size: 12px;
	border: 1px solid white;
}

.ui-picker-candidate {
	cursor: pointer;
}

.ui-picker-candidate:hover {
	background: #0cf5;
}

.ui-picker-hidden {
	display: none;
}
`);

// common/Utils/index.js
function clsx(prefix) {
	return (...args) => args.filter(Boolean).map((a) => `${prefix}-${a}`).join(" ");
}

// src/HideStuff/utils.js
function exceptionWrap(fn, expects) {
	return (...args) => {
		try {
			return fn(...args);
		} catch {
			return expects;
		}
	};
}
var safeQuery = exceptionWrap((selector) => document.querySelector(selector));
var safeQueryAll = exceptionWrap((selector) => document.querySelectorAll(selector), []);
var safeQueryNode = exceptionWrap((node, selector) => node.querySelector(selector));
var safeQueryAllNode = exceptionWrap((node, selector) => node.querySelectorAll(selector), []);

function getCssSelector(elem) {
	if (elem === null) return 0;
	if (elem.nodeType !== 1) return 0;
	let selector = "";
	let v = typeof elem.id === "string" && CSS.escape(elem.id);
	if (v) {
		selector = `#${v}`;
	}
	v = elem.classList;
	if (v) {
		let i = v.length || 0;
		while (i--) {
			selector += `.${CSS.escape(v.item(i))}`;
		}
	}
	const tagName = CSS.escape(elem.localName);
	if (selector === "") {
		const attributes = [];
		let attr;
		switch (tagName) {
			case "a":
				v = elem.getAttribute("href");
				if (v) {
					v = v.trim().replace(/\?.*$/, "");
					if (v.length) {
						attributes.push({ k: "href", v });
					}
				}
				break;
			case "iframe":
			case "img":
				v = elem.getAttribute("src");
				if (v && v.length !== 0) {
					v = v.trim();
					if (v.startsWith("data:")) {
						const pos = v.indexOf(",");
						if (pos !== -1) {
							v = v.slice(0, pos + 1);
						}
					} else if (v.startsWith("blob:")) {
						v = new URL(v.slice(5));
						v.pathname = "";
						v = `blob:${v.href}`;
					}
					attributes.push({ k: "src", v: v.slice(0, 256) });
					break;
				}
				v = elem.getAttribute("alt");
				if (v && v.length !== 0) {
					attributes.push({ k: "alt", v });
					break;
				}
				break;
			default:
				break;
		}
		while (attr = attributes.pop()) {
			if (attr.v.length === 0) {
				continue;
			}
			const w = attr.v.replace(/([^\\])"/g, '$1\\"');
			v = elem.getAttribute(attr.k);
			if (attr.v === v) {
				selector += `[${attr.k}="${w}"]`;
			} else if (v.startsWith(attr.v)) {
				selector += `[${attr.k}^="${w}"]`;
			} else {
				selector += `[${attr.k}*="${w}"]`;
			}
		}
	}
	const parentNode = elem.parentNode;
	if (selector === "" || safeQueryAllNode(parentNode, `:scope > ${selector}`).length > 1) {
		selector = tagName + selector;
	}
	if (safeQueryAllNode(parentNode, `:scope > ${selector}`).length > 1) {
		let i = 1;
		while (elem.previousSibling !== null) {
			elem = elem.previousSibling;
			if (typeof elem.localName === "string" && elem.localName === tagName) {
				i++;
			}
		}
		selector += `:nth-of-type(${i})`;
	}
	return selector;
}

function optimizeCandidates(filters, slot) {
	const specificities = [
		0,
		// remove hierarchy; remove id, nth-of-type, attribute values
		2,
		// remove hierarchy; remove id, nth-of-type
		3,
		// remove hierarchy
		8,
		// trim hierarchy; remove id, nth-of-type, attribute values
		10,
		// trim hierarchy; remove id, nth-of-type
		12,
		// remove id, nth-of-type, attribute values
		14,
		// remove id, nth-of-type
		15
		// keep all = most specific
	];
	const candidates2 = [];
	let filter = filters[slot];
	for (const specificity of specificities) {
		const paths = [];
		for (let i = slot; i < filters.length; i++) {
			filter = filters[i];
			if ((specificity & 1) === 0) {
				filter = filter.replace(/:nth-of-type\(\d+\)/, "");
				if (filter.charAt(0) === "#" && ((specificity & 8) === 0 || i === slot)) {
					const pos = filter.search(/[^\\]\./);
					if (pos !== -1) {
						filter = filter.slice(pos + 1);
					}
				}
			}
			if ((specificity & 2) === 0) {
				const match = /^\[([^^*$=]+)[\^*$]?=.+\]$/.exec(filter);
				if (match !== null) {
					filter = `[${match[1]}]`;
				}
			}
			if (filter.charAt(0) === "#") {
				filter = filter.replace(/([^\\])\..+$/, "$1");
			}
			if (paths.length !== 0) {
				filter += " > ";
			}
			paths.unshift(filter);
			if ((specificity & 8) === 0 || filter.startsWith("#")) {
				break;
			}
		}
		if ((specificity & 12) === 8) {
			let i = 0;
			while (i < paths.length - 1) {
				if (/^[a-z0-9]+ > $/.test(paths[i + 1])) {
					if (paths[i].endsWith(" > ")) {
						paths[i] = paths[i].slice(0, -2);
					}
					paths.splice(i + 1, 1);
				} else {
					i += 1;
				}
			}
		}
		if (paths.length !== 0 && paths[0].startsWith("#") === false && paths[0].startsWith("body ") === false && (specificity & 12) !== 0) {
			paths.unshift("body > ");
		}
		candidates2.push(paths);
	}
	const results = [];
	for (const paths of candidates2) {
		let count = Number.MAX_SAFE_INTEGER;
		let selector = "";
		for (let i = 0, n = paths.length; i < n; i++) {
			const s = paths.slice(n - i - 1).join("");
			const elems = document.querySelectorAll(s);
			if (elems.length < count) {
				selector = s;
				count = elems.length;
			}
		}
		results.push({ selector, count });
	}
	results.sort((a, b) => {
		const r = b.count - a.count;
		if (r !== 0) {
			return r;
		}
		return a.selector.length - b.selector.length;
	});
	return results.map((a) => a.selector);
}

// src/HideStuff/index.jsx
var c = clsx("ui-picker");
var html = `<div class="${c("container")}">
	<div class="${c("highlighter")}">
		<svg class="${c("svg")}">
			<path class="${c("marker")}"></path>
		</svg>
	</div>
	<div class="${c("editor")}">
		<div class="${c("header")}">
			<div class="${c("drag-handle")}"></div>
			<button class="${c("close")}">X</button>
		</div>
		<div class="${c("content")}">
			<textarea class="${c("textarea")}"></textarea>
			<div class="${c("controls")}">
				<div class="${c("specificity")}">
					<input class="${c("range")}" type="range" min="0" max="7" value="6">
				</div>
				<div class="${c("buttons")}">
					<button class="${c("pick")}">pick</button>
					<button class="${c("preview")}">preview</button>
					<button class="${c("create")}">create</button>
				</div>
			</div>
			<ul class="${c("candidates")}"></ul>
		</div>
	</div>
</div>`;
var dom;
var pick;
var preview;
var create;
var highlighter;
var textarea;
var range;
var candidates;
var svg;
var editor;
var closeBtn;
var selectedSelector;
var working = false;
var pause = false;
var selectedCoords = { x: 0, y: 0 };
var selectors = [];
var selectedCandidate = 0;
var root = safeQuery("html");

function elementsFromPoint({ x, y }) {
	const elements = document.elementsFromPoint(x, y);
	let elem = null;
	for (let i = 0; i < elements.length; i++) {
		if (elements[i].classList.value.includes("ui-picker")) continue;
		elem = elements[i];
		break;
	}
	const results = [];
	while (elem && elem !== document.body) {
		results.push(elem);
		elem = elem.parentNode;
	}
	return results;
}

function getPath(el) {
	const rect = el.getBoundingClientRect();
	return `M${rect.left} ${rect.top}h${rect.width}v${rect.height}h-${rect.width}z`;
}

function highlightElement(el) {
	const marker = getPath(el);
	path.setAttribute("d", marker);
}

function highlightElements(els) {
	const marker = [...els].map(getPath).join("");
	path.setAttribute("d", marker);
}

function highlightElementsFromSelector(selector) {
	const els = safeQueryAll(selector);
	highlightElements(els);
}

function onMousemove(e) {
	if (pause) return;
	const el = elementsFromPoint(e)[0];
	if (!el) return;
	selectedCoords = { x: e.x, y: e.y };
	highlightElement(el);
}

function onCandidateClick(e) {
	const index = e.target.getAttribute("data-selector-index");
	if (index == null) return;
	selectedCandidate = index;
	const optimizedSelectors = optimizeCandidates(selectors, index);
	const i = range.value || 6;
	const selector = optimizedSelectors[i];
	textarea.value = selectedSelector = selector;
	highlightElementsFromSelector(selector);
}

function onTextareaChange(e) {
	const value = selectedSelector = e.target.value;
	highlightElementsFromSelector(value);
}

function onPick() {
	editor.classList.add(c("hidden"));
	pause = false;
	if (previewState) {
		onPreview();
	}
}
var previewState = false;

function onPreview() {
	highlighter.classList.toggle(c("preview"));
	if (!previewState)
		dom.appendChild(
			Object.assign(document.createElement("style"), {
				textContent: `${selectedSelector}{display:none !important;}`
			})
		);
	else safeQueryNode(dom, "style")?.remove();
	previewState = !previewState;
}

function onCreate() {
	const savedSelectors = Data.load("selectors") || [];
	savedSelectors.push(selectedSelector);
	BdApi.DOM.addStyle("picker", `${savedSelectors.join(",")}{display:none;}`);
	stopPicker();
}

function onRangeChange(e) {
	const val = e.target.value;
	const optimizedSelectors = optimizeCandidates(selectors, selectedCandidate);
	textarea.value = selectedSelector = optimizedSelectors[val];
	const els = safeQueryAll(selectedSelector);
	highlightElements(els);
}

function onElementClick() {
	pause = true;
	const els = elementsFromPoint(selectedCoords);
	selectors = els.map(getCssSelector);
	const i = range.value || 6;
	const optimizedSelectors = optimizeCandidates(selectors, 0);
	console.log(optimizedSelectors);
	highlightElementsFromSelector(optimizedSelectors[i]);
	textarea.value = selectedSelector = optimizedSelectors[i];
	candidates.innerHTML = "";
	for (let i2 = 0; i2 < selectors.length; i2++) {
		const selector = selectors[i2];
		const li = document.createElement("li");
		li.onclick = onCandidateClick;
		li.setAttribute("data-selector-index", i2);
		li.classList.add(c("candidate"));
		li.innerHTML = selector;
		candidates.appendChild(li);
	}
	editor.classList.remove(c("hidden"));
}

function startPicker() {
	if (working) return;
	working = true;
	pause = false;
	editor.classList.add(c("hidden"));
	document.body.insertAdjacentElement("afterEnd", dom);
	document.addEventListener("mousemove", onMousemove);
}

function stopPicker() {
	if (!working) return;
	working = false;
	pause = false;
	previewState = false;
	dom.remove();
	selectedSelector = null;
	selectedCoords = { x: 0, y: 0 };
	selectedCandidate = null;
	selectors = [];
	document.removeEventListener("mousemove", onMousemove);
}

function onClosePicker() {
	stopPicker();
}

function init() {
	dom = DOM.parseHTML(html);
	highlighter = safeQueryNode(dom, ".ui-picker-highlighter");
	editor = safeQueryNode(dom, ".ui-picker-editor");
	closeBtn = safeQueryNode(dom, ".ui-picker-close");
	textarea = safeQueryNode(dom, ".ui-picker-textarea");
	candidates = safeQueryNode(dom, ".ui-picker-candidates");
	pick = safeQueryNode(dom, ".ui-picker-pick");
	preview = safeQueryNode(dom, ".ui-picker-preview");
	create = safeQueryNode(dom, ".ui-picker-create");
	range = safeQueryNode(dom, ".ui-picker-range");
	svg = safeQueryNode(dom, ".ui-picker-highlighter > svg");
	path = safeQueryNode(dom, ".ui-picker-highlighter > svg > path");
	range.addEventListener("input", onRangeChange);
	textarea.addEventListener("keyup", onTextareaChange);
	highlighter.addEventListener("click", onElementClick);
	pick.addEventListener("click", onPick);
	preview.addEventListener("click", onPreview);
	create.addEventListener("click", onCreate);
	closeBtn.addEventListener("click", onClosePicker);
	window.addEventListener("keyup", onKeyup);
	const savedSelectors = Data.load("selectors") || [];
	BdApi.DOM.addStyle("picker", `${savedSelectors.join(",")}{display:none;}`);
}

function dispose() {
	if (!dom) return;
	stopPicker();
	BdApi.DOM.removeStyle("picker");
	range.removeEventListener("input", onRangeChange);
	pick.removeEventListener("click", onPick);
	preview.removeEventListener("click", onPreview);
	create.removeEventListener("click", onCreate);
	textarea.removeEventListener("keyup", onTextareaChange);
	highlighter.removeEventListener("click", onElementClick);
	closeBtn.removeEventListener("click", onClosePicker);
	document.removeEventListener("mousemove", onMousemove);
	window.removeEventListener("keyup", onKeyup);
	pick = preview = range = create = highlighter = closeBtn = candidates = textarea = editor = dom = null;
}

function onKeyup({ key, shiftKey, ctrlKey }) {
	if ((key === "p" || key === "P") && shiftKey && ctrlKey) startPicker();
	else if (key === "Escape") stopPicker();
}
Plugin_default.on(Events.START, () => {
	init();
});
Plugin_default.on(Events.STOP, () => {
	dispose();
});
module.exports = () => Plugin_default;

import "./styles";
import Plugin, { Events } from "@Utils/Plugin";
import { clsx } from "@Utils";
import { Data, DOM } from "@Api";
import { safeQueryAll, safeQuery, safeQueryNode, optimizeCandidates, getCssSelector } from "./utils";

const c = clsx("ui-picker");

const html = `<div class="${c("container")}">
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


let dom;
let pick;
let preview;
let create;
let highlighter;
let textarea;
let range;
let candidates;
let svg;
let editor;
let closeBtn;
let selectedSelector;
let working = false;
let pause = false;
let selectedCoords = { x: 0, y: 0 };
let selectors = [];
let selectedCandidate = 0;
const root = safeQuery("html");

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

function getPath(el){
	const rect = el.getBoundingClientRect();
	return `M${rect.left} ${rect.top}h${rect.width}v${rect.height}h-${rect.width}z`;
}

function getMarkerFor(el) {
	const marker = document.createElement("div");
	marker.classList.add(c("marker"));
	const targetRect = el.getBoundingClientRect();
	marker.style.height = `${targetRect.height}px`;
	marker.style.width = `${targetRect.width}px`;
	marker.style.left = `${targetRect.x}px`;
	marker.style.top = `${targetRect.y}px`;
	return marker;
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
	const value = (selectedSelector = e.target.value);
	highlightElementsFromSelector(value);
}

function onPick() {
	editor.classList.add(c("hidden"));
	pause = false;
	if (previewState) {
		onPreview();
	}
}

let previewState = false;

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
	BdApi.DOM.addStyle("picker",`${savedSelectors.join(",")}{display:none;}`);
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
	for (let i = 0; i < selectors.length; i++) {
		const selector = selectors[i];
		const li = document.createElement("li");
		li.onclick = onCandidateClick;
		li.setAttribute("data-selector-index", i);
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
	BdApi.DOM.addStyle("picker",`${savedSelectors.join(",")}{display:none;}`);
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

Plugin.on(Events.START, () => {
	init();
});

Plugin.on(Events.STOP, () => {
	dispose();
});

module.exports = () => Plugin;

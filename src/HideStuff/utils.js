function exceptionWrap(fn, expects) {
	return (...args) => {
		try {
			return fn(...args);
		} catch {
			return expects;
		}
	};
}

export const safeQuery = exceptionWrap(selector => document.querySelector(selector));
export const safeQueryAll = exceptionWrap(selector => document.querySelectorAll(selector), []);
export const safeQueryNode = exceptionWrap((node, selector) => node.querySelector(selector));
export const safeQueryAllNode = exceptionWrap((node, selector) => node.querySelectorAll(selector), []);



export function getCssSelector(elem) {
	if (elem === null) return 0;
	if (elem.nodeType !== 1) return 0;

	let selector = "";
	// Id
	let v = typeof elem.id === "string" && CSS.escape(elem.id);
	if (v) {
		selector = `#${v}`;
	}

	// Class(es)
	v = elem.classList;
	if (v) {
		let i = v.length || 0;
		while (i--) {
			selector += `.${CSS.escape(v.item(i))}`;
		}
	}

	// Tag name
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
						attributes.push({ k: "href", v: v });
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
					attributes.push({ k: "alt", v: v });
					break;
				}
				break;
			default:
				break;
		}
		while ((attr = attributes.pop())) {
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

export function optimizeCandidates(filters, slot) {
	const specificities = [
		0b0000, // remove hierarchy; remove id, nth-of-type, attribute values
		0b0010, // remove hierarchy; remove id, nth-of-type
		0b0011, // remove hierarchy
		0b1000, // trim hierarchy; remove id, nth-of-type, attribute values
		0b1010, // trim hierarchy; remove id, nth-of-type
		0b1100, // remove id, nth-of-type, attribute values
		0b1110, // remove id, nth-of-type
		0b1111 // keep all = most specific
	];

	const candidates = [];

	let filter = filters[slot];

	for (const specificity of specificities) {
		const paths = [];
		for (let i = slot; i < filters.length; i++) {
			filter = filters[i];

			if ((specificity & 0b0001) === 0) {
				filter = filter.replace(/:nth-of-type\(\d+\)/, "");
				if (filter.charAt(0) === "#" && ((specificity & 0b1000) === 0 || i === slot)) {
					const pos = filter.search(/[^\\]\./);
					if (pos !== -1) {
						filter = filter.slice(pos + 1);
					}
				}
			}

			if ((specificity & 0b0010) === 0) {
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

			if ((specificity & 0b1000) === 0 || filter.startsWith("#")) {
				break;
			}
		}

		if ((specificity & 0b1100) === 0b1000) {
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

		if (paths.length !== 0 && paths[0].startsWith("#") === false && paths[0].startsWith("body ") === false && (specificity & 0b1100) !== 0) {
			paths.unshift("body > ");
		}

		candidates.push(paths);
	}

	const results = [];
	for (const paths of candidates) {
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

	return results.map(a => a.selector);
};

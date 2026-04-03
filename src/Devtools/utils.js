import { findInTree, getInternalInstance } from "@Api";

export function walkFiber(filter = a => a, depth, el) {
	el ??= $0;
	depth = depth < 1 || !depth ? 1 : depth;

	let fiber = getInternalInstance(el);
	if (!fiber) return console.error("Can't find fiber");
	let res = [];
	while (fiber) {
		let match;
		try {
			if (filter(fiber)) match = fiber;
		} catch {}

		if (match) {
			if (depth === 1) return match;
			res.push(match);
			if (res.length === depth) return res;
		}

		fiber = fiber.return;
	}

	return res;
}

export function getFiber() {
	return getInternalInstance($0);
}

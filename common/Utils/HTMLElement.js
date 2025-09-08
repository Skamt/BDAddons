export function getElRect(el) {
	if (!el) return;
	const rect = el.getBoundingClientRect().toJSON();
	rect.el = el;
	return rect;
}

export function getElMeta(target) {
	if (!target) return;
	const res = {
		parentMeta: getElRect(target.parentElement),
		nextSiblingMeta: getElRect(target.nextElementSibling),
		previousSiblingMeta: getElRect(target.previousElementSibling),
		targetMeta: getElRect(target)
	};

	return res;
}


export function isScrollable(el, dir = "h") {
	switch (dir) {
		case "h":
		case "H":
			return el.scrollWidth > el.clientWidth;
		case "v":
		case "V":
			return el.scrollHeight > el.clientHeight;
	}	
}

// from Material-UI
function easeInOutSin(time) {
	return (1 + Math.sin(Math.PI * time - Math.PI / 2)) / 2;
}

// from Material-UI
export function animate(property, element, to, options = {}, cb = () => {}) {
	const {
		ease = easeInOutSin,
		duration = 300 // standard
	} = options;

	let start = null;
	const from = element[property];
	let cancelled = false;

	const cancel = () => {
		cancelled = true;
	};

	const step = timestamp => {
		if (cancelled) {
			cb(new Error("Animation cancelled"));
			return;
		}

		if (start === null) {
			start = timestamp;
		}
		const time = Math.min(1, (timestamp - start) / duration);

		element[property] = ease(time) * (to - from) + from;

		if (time >= 1) {
			requestAnimationFrame(() => {
				cb(null);
			});
			return;
		}

		requestAnimationFrame(step);
	};

	if (from === to) {
		cb(new Error("Element already at target position"));
		return cancel;
	}

	requestAnimationFrame(step);
	return cancel;
}

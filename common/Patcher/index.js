import { Patcher } from "@Api";
import { patch } from "./shared";

function once(type, object, key, callback) {
	const unpatch = patch(type, object, key,  (...args) => {
		unpatch();
		callback.apply(null, args);
	});
}

export const after = (...args) => patch("after", ...args);
export const afterOnce = (...args) => once("after", ...args);

export const before = (...args) => patch("before", ...args);
export const beforeOnce = (...args) => once("before", ...args);

export const instead = (...args) => patch("instead", ...args);
export const insteadOnce = (...args) => once("instead", ...args);

export default Patcher;

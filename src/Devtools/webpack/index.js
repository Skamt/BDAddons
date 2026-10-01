import { Sources } from "./Sources";
import { Modules } from "./Modules";
import { Decs } from "./Decs";
import { Stores } from "./Stores";
import { Misc } from "./Misc";
import webpackreq from "./webpackRequire";

function s(a, ...args) {
	if (typeof a === "function") return Sources.getSourceByFunc(a);
	if (Number.isInteger(+a)) return Modules.moduleById(a);
	if (typeof a === "string" && a.endsWith("Store")) return Stores.getStore(name);
	return Sources.getSources(a, ...args);
}

export default Object.assign(s, {
	r: webpackreq,
	...Misc,
	...Stores,
	...Sources,
	...Decs,
	...Modules
});

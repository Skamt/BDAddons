import { Modules } from "./Modules";
import { Sources } from "./Sources";
import { Stores } from "./Stores";

function defineModuleGetter(obj, id) {
	return Object.defineProperty(obj, id, {
		enumerable: true,
		get() {
			return Modules.moduleById(id);
		}
	});
}

function defineGetter(obj, id, val) {
	Object.defineProperty(obj, id, {
		get() {
			return val;
		}
	});
}

export class Module {
	constructor(module) {
		defineGetter(this, "module", module);
	}

	get id() {
		return this.module.id;
	}

	get source() {
		return Sources.sourceById(this.module.id);
	}
	get exports() {
		return this.module.exports;
	}

	get modulesUsed() {
		return Modules.modulesImportedInModuleById(this.module.id).reduce((acc, id) => defineModuleGetter(acc, id), {});
	}

	get modulesUsing() {
		return Modules.modulesImportingModuleById(this.module.id).reduce((acc, id) => defineModuleGetter(acc, id), {});
	}
}

export class Source {
	constructor(source) {
		defineGetter(this, "source", source);
	}

	get loader() {
		return this.source.source;
	}

	get id() {
		return this.source.id;
	}

	get module() {
		return Modules.moduleById(this.source.id);
	}

	get string(){
		return this.source.source.toString();
	}
}

export class Store {
	constructor(module) {
		defineGetter(this, "module", module);
		this.name = this.store.getName();

		const methods = {};
		const _this = this;
		Object.getOwnPropertyNames(this.store.__proto__).forEach(key => {
			if (key === "constructor") return;
			const func = this.store[key];
			if (typeof func !== "function") return;
			if (func.length === 0)
				return Object.defineProperty(methods, key, {
					get() { return _this.store[key](); }
				});
			else methods[key] = func;
		});

		defineGetter(this, "methods", methods);
	}

	get store() {
		for (const key of ["Z", "ZP", "default"])
			if (key in this.module.exports) return this.module.exports[key];
	}

	get localVars() {
		return this.store.__getLocalVars();
	}
	
	get events() {
		return Stores.getStoreListeners(this.name);
	}
}
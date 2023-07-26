import Modules from "./Modules";
import Sources from "./Sources";
import Stores from "./Stores";

function defineModuleGetter(obj, id) {
	return Object.defineProperty(obj, id, {
		enumerable: true,
		get() {
			return Modules.moduleById(id);
		}
	});
}

export class Module {
	constructor(module) {
		this.rawModule = module;
	}

	get id() {
		return this.rawModule.id;
	}

	get source() {
		return Sources.sourceById(this.rawModule.id);
	}
	get exports() {
		return this.rawModule.exports;
	}

	get modulesImported() {
		return Modules.modulesImportedInModuleById(this.rawModule.id).reduce((acc, id) => defineModuleGetter(acc, id), {});
	}

	get modulesImportedIn() {
		return Modules.modulesImportingModuleById(this.rawModule.id).reduce((acc, id) => defineModuleGetter(acc, id), {});
	}
}

export class Source {
	constructor(source) {
		this.rawSource = source;
	}

	get source() {
		return this.rawSource.source;
	}

	get id() {
		return this.rawSource.id;
	}

	get module() {
		return Modules.moduleById(this.rawSource.id);
	}
}

export class Store {
	constructor(store) {
		this.store = store;
		this.name = store.getName();
	}
	get localVars() {
		return this.store.__getLocalVars();
	}
	get events() {
		return Stores.getStoreListeners(this.name);
	}
}
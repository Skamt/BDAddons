import { Data } from "@Api";

export default new (class extends Set {
	commit() {
		Data.save("blacklist", Array.from(this));
	}

	add(...args) {
		super.add.apply(this, args);
		this.commit();
	}

	delete(...args) {
		super.delete.apply(this, args);
		this.commit();
	}

	toggle(id) {
		if (this.has(id)) this.delete(id);
		else this.add(id);
	}
})(Data.load("blacklist"));

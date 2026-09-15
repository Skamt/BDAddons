import Plugin from "@common/Plugin";
const ControlKeys = {
	init() {
		this.subs = ["keydown", "keyup"].map(event => {
			const handler = e => (this.e = e);
			document.addEventListener(event, handler);
			return () => document.removeEventListener(event, handler);
		});
	},
	clean() {
		this.subs?.forEach(unsub => unsub && typeof unsub === "function" && unsub());
	},
	get ctrlKey() {
		return this.e?.ctrlKey;
	},
	get shiftKey() {
		return this.e?.shiftKey;
	},
	get metaKey() {
		return this.e?.metaKey;
	}
};

Plugin.onStart(() => {
	ControlKeys.init();
});

Plugin.onStop(() => {
	ControlKeys.clean();
});

export default ControlKeys;
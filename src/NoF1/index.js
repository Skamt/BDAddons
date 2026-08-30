import { getByKeys } from "@Webpack";

const KeyBindManager = getByKeys("setLayout", "enable");
const KeyBinds = getByKeys("TOGGLE_HELP", "BROWSER_DEVTOOLS");

const keyBindsCopy = {
	...KeyBinds,
	TOGGLE_HELP: {
		...KeyBinds.TOGGLE_HELP,
		binds: KeyBinds.TOGGLE_HELP.binds.filter((a) => a !== "f1"),
	},
};

function updateKeybinds(keybinds) {
	KeyBindManager.disable();
	KeyBindManager.setLayout(keybinds);
	KeyBindManager.enable();
}

module.exports = () => ({
	start: () => updateKeybinds(keyBindsCopy),
	stop: () => updateKeybinds(KeyBinds),
});

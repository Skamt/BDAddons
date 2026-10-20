import Plugin from "@common/Plugin";
import { loop } from "@Utils/Array";

const ControlKeys = {};

const handler = e => {
	ControlKeys.ctrlKey = e.ctrlKey ;
	ControlKeys.shiftKey = e.shiftKey ;
	ControlKeys.metaKey = e.metaKey ;
};
Plugin.onStart(() => loop(["keydown", "keyup"], event => document.addEventListener(event, handler)));
Plugin.onStop(() => loop(["keydown", "keyup"], event => document.removeEventListener(event, handler)));

export default ControlKeys;

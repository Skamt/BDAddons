import { Filters, getDeclarationAndKey } from "@Webpack";

function onKeyDown(e) {
	const CtrlTab = e.key === "Tab" && e.ctrlKey;
	const CtrlShiftTab = CtrlTab && e.shiftKey;

	if(CtrlShiftTab || CtrlTab) e.stopPropagation();

	if(CtrlShiftTab) {

	}

	else if (CtrlTab) {

	};
	
}

module.exports = () => ({
	start() {
		// document.addEventListener("keydown", onKeyDown);
		// document.addEventListener("keyup",onKeyDown);
	},
	stop() {
		// document.removeEventListener("keydown", onKeyDown);
		// document.removeEventListener("keyup",onKeyDown);
	}
});

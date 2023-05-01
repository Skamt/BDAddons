import config from "@config";
import { UI } from "@Api";

function showToast(content, type) {
	UI.showToast(`[${config.info.name}] ${content}`, { type });
}

export default {
	success(content) { showToast(content, "success"); },
	info(content) { showToast(content, "info"); },
	warning(content) { showToast(content, "warning"); },
	error(content) { showToast(content, "error"); }
}
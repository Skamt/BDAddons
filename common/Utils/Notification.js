import config from "@Config";
import { UI } from "@Api";

function showNotification(title, content, options) {
	// UI.showToast(`[${config.info.name}] ${content}`, { timeout:5000, type });

	UI.showNotification({
		id: `${config.info.name}-${Math.random().toString(36).slice(2)}`,
		title: title ? `[${config.info.name}] ${title}` : config.info.name,
		content: content,
		duration: Number.POSITIVE_INFINITY,
		...options
	});
}

export default {
	success(title, content, options) {
		showNotification(title, content, { type: "success", ...options });
	},
	info(content) {
		showNotification(title, content, { type: "info", ...options });
	},
	warning(content) {
		showNotification(title, content, { type: "warning", ...options });
	},
	error(content) {
		showNotification(title, content, { type: "error", ...options });
	}
};

import React from "@React";
import config from "@Config";
import { classNameFactory } from "@Utils/css";
const c = classNameFactory(`${config.info.name}-menuitem`);
import Store from "@/Store";

import { copyItem } from "./shared";

export function wrapMenuItem(item) {
	if (!item?.label) return item;
	const tag = item.label.toLowerCase().replace(/^[^a-z]+|[^\w-]+/gi, "-");
	return {
		id: c(tag),
		className: c(tag),
		...item,
	};
}

export function getFolders(transformer) {
	const items = [];
	for (let i = 0; i < Store.state.folders.length; i++) {
		const folder = Store.state.folders[i];
		const item = transformer(folder.id, folder.name);
		if (item) items.push(item);
	}
	return sanitize(items);
}

export function getCopies({ guildId, userId, path, channelId }) {
	const items = [];
	if (channelId) items.push(copyItem("channel", channelId));
	if (guildId) items.push(copyItem("guild", guildId));
	if (userId) items.push(copyItem("user", userId));
	if (path) items.push(copyItem("path", path));

	return sanitize(items);
}

export const sanitize = (items) => items.filter(Boolean).map(wrapMenuItem);

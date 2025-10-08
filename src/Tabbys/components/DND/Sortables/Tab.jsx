import DroppableMarkup from "./DroppableMarkup";
import { DropTarget } from "@Discord/Modules";
import { DNDTypes } from "@/consts";
import Store from "@/Store";
import { openTabAt, openBookmarkAt } from "@/Store/methods";
import { makeDroppable } from "../shared";
import React from "@React";

const Tab = makeDroppable(
	[DNDTypes.DRAGGABLE_GUILD_CHANNEL, DNDTypes.TAB, DNDTypes.BOOKMARK, DNDTypes.SUB_BOOKMARK],

	(me, monitor) => {
		const dropped = monitor.getItem();
		if (me.id === dropped.id) return;
		const itemType = monitor.getItemType();

		switch (itemType) {
			case DNDTypes.TAB:
				return Store.reOrderTabs(dropped.id, me.id, me.pos);
			case DNDTypes.BOOKMARK:
				return openBookmarkAt(dropped.id, me.id, me.pos);
			case DNDTypes.SUB_BOOKMARK:
				return openBookmarkAt(dropped.id, me.id, me.pos, dropped.parentId);
			case DNDTypes.DRAGGABLE_GUILD_CHANNEL:
				return openTabAt(`/channels/${dropped.guildId}/${dropped.id}`, me.id, me.pos);
		}
	}
)(DroppableMarkup);

export default function ({ id }) {
	return (
		<>
			<Tab
				id={id}
				pos="after"
			/>
			<Tab
				id={id}
				pos="before"
			/>
		</>
	);
}

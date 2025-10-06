import Store from "@/Store";
import React from "@React";
import BaseBookmark from "./BaseBookmark";
import ChannelBookmark from "./ChannelBookmark";
import DMBookmark from "./DMBookmark";
import { makeDraggable } from "@/components/DND/shared";
import { DNDTypes } from "@/consts";
import { MiscIcon } from "@/components/Icons";
import { SubBookmarkSortable, BookmarkSortable } from "@/components/DND";
import { shallow } from "@Utils";
import { pathTypes } from "@/consts";

function BookmarkSwitch({ id, parentId, dragRef, ...rest }) {
	const { type, ...bookmark } = Store(state => (parentId ? Store.getFolderItem(parentId, id) : Store.getBookmark(id)), shallow) || {};

	let props = { ...bookmark, ...rest, id, ref: dragRef };

	if (parentId)
		props = Object.assign(props, {
			parentId,
			className: "folder-item",
			children: (
				<SubBookmarkSortable
					id={id}
					parentId={parentId}
				/>
			)
		});
	else
		props = Object.assign(props, {
			"data-id": id,
			children: <BookmarkSortable id={id} />
		});

	switch (type) {
		case pathTypes.CHANNEL:
			return <ChannelBookmark {...props} />;
		case pathTypes.DM:
			return <DMBookmark {...props} />;
		default:
			return (
				<BaseBookmark
					{...props}
					title={props.name || props.title}
					icon={<MiscIcon type={type} />}
				/>
			);
	}
}

export const Bookmark = React.memo(makeDraggable(DNDTypes.BOOKMARK)(props => <BookmarkSwitch {...props} />));
export const SubBookmark = React.memo(makeDraggable(DNDTypes.SUB_BOOKMARK)(props => <BookmarkSwitch {...props} />));

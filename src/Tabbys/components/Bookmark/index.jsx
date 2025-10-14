import "./styles";
import Store from "@/Store";
import { openBookmark } from "@/Store/methods";
import React from "@React";
import { join } from "@Utils/css";
import BookmarkContextMenu from "@/contextmenus/BookmarkContextMenu";
import { ContextMenu } from "@Api";
import useStateFromStores from "@Modules/useStateFromStores";
import ReadStateStore from "@Stores/ReadStateStore";
import Settings from "@Utils/Settings";
import { SubBookmarkSortable, BookmarkSortable } from "@/components/DND";
import { makeDraggable } from "@/components/DND/shared";
import ChannelStatus from "@/components/ChannelStatus";
import { DNDTypes } from "@/consts";
import { shallow } from "@Utils";
import { Content, HideTitleContext } from "@/components/Card";

function BaseBookmark({ id, parentId, dragRef, onClose, className }) {
	const shouldHightLight = Settings(Settings.selectors.highlightBookmarkUnread);
	const bookmark = Store(state => (parentId ? Store.getFolderItem(parentId, id) : Store.getBookmark(id)), shallow) || {};
	const { noName, guildId, userId, path, channelId } = bookmark;
	const hasUnread = useStateFromStores([ReadStateStore], () => shouldHightLight && ReadStateStore.hasUnread(channelId), [shouldHightLight, channelId]);
	const isSubBookmark = !!parentId;

	const sortHandle = isSubBookmark ? (
		<SubBookmarkSortable
			id={id}
			parentId={parentId}
		/>
	) : (
		<BookmarkSortable id={id} />
	);

	const onClick = e => {
		e.stopPropagation();
		onClose?.();

		if (e.ctrlKey) Store.newTab(path);
		else openBookmark(id, parentId);
	};

	const contextmenuHandler = e => {
		ContextMenu.open(e, BookmarkContextMenu(id, { path, guildId, userId, parentId, channelId, hasUnread }), {
			position: "bottom",
			align: "left"
		});
	};

	return (
		<div
			data-id={isSubBookmark ? null : id}
			ref={dragRef}
			onContextMenu={contextmenuHandler}
			className={join("bookmark-container", "card", isSubBookmark && "folder-item", className, { hasUnread })}
			onClick={onClick}>
			<HideTitleContext.Provider value={noName}>
				<Content {...bookmark} />
			</HideTitleContext.Provider>
			<ChannelStatus
				type="Bookmark"
				channelIds={[channelId]}
			/>
			{sortHandle}
		</div>
	);
}

export const Bookmark = React.memo(makeDraggable(DNDTypes.BOOKMARK)(props => <BaseBookmark {...props} />));
export const SubBookmark = React.memo(makeDraggable(DNDTypes.SUB_BOOKMARK)(props => <BaseBookmark {...props} />));

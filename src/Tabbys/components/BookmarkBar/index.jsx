import "./styles";
import { Store } from "@/Store";
import React from "@React";
import CloseIcon from "@Components/icons/CloseIcon";
import { nop, shallow, concateClassNames } from "@Utils";
import DiscordIcon from "@Components/icons/DiscordIcon";
import LightiningIcon from "@Components/icons/LightiningIcon";
import BookmarkIcon from "@Components/icons/BookmarkIcon";
import DuplicateIcon from "@Components/icons/DuplicateIcon";
import VectorIcon from "@Components/icons/VectorIcon";
import PinIcon from "@Components/icons/PinIcon";
import ContextMenu, { MenuLabel } from "@Components/ContextMenu";
// import { DragSource, DropTarget } from "@Discord/Modules";
import ChannelStore from "@Stores/ChannelStore";
import useStateFromStores from "@Modules/useStateFromStores";
import { getChannelName, getChannelIcon } from "@/utils";
const ICON_SIZE = 80;
function d(id = "", action = nop, label = "Unknown", icon = null, color = "", children = []) {
	return {
		className: `channeltab-${id}-menuitem`,
		id,
		color,
		action,
		children,
		label: (
			<MenuLabel
				label={label}
				icon={icon}
			/>
		)
	};
}

function XX({ id, path, icon, title }) {
	return (
		<div className="bookmark">
			<ContextMenu
				showOnContextMenu={true}
				position="bottom"
				align="left"
				menuClassName="channeltab-tab-contextmenu"
				menuItems={[d("new-tab-right", console.log, "New Tab to Right", <VectorIcon />), d("new-tab-left", console.log, "New Tab to Left", <VectorIcon left={true} />), { type: "separator" }, d("duplicate-tab", console.log, "Duplicate Tab", <DuplicateIcon />), d("pin-tab", console.log, "Pin Tab", <PinIcon />), d("bookmark-tab", console.log, "Bookmark Tab", <BookmarkIcon />), { type: "separator" }, d("close-tab", console.log, "Close", <CloseIcon />, "danger"), d("close-tab-multiple", console.log, "Close Multiple", <CloseIcon />, "danger", [d("close-tabs-to-right", console.log, "Close Tabs to Right", <VectorIcon />, "danger"), d("close-tabs-to-left", console.log, "Close Tabs to Left", <VectorIcon left={true} />, "danger"), d("close-other-tabs", console.log, "Close Other Tabs", <LightiningIcon />, "danger")])]}>
				<div className="contextmenu-handler" />
			</ContextMenu>
			<div className={concateClassNames("bookmark-icon", !icon && "discord-icon")}>{icon || <DiscordIcon />}</div>
			<div className="bookmark-title ellipsis">{title || path}</div>
		</div>
	);
}

function D({ tabId, channelId, path }) {
	const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(channelId), [channelId]);
	if (!channel) return;
	const channelName = getChannelName(channel, ICON_SIZE) || "Home";
	const iconSrc = getChannelIcon(channel, ICON_SIZE);
	const icon = iconSrc && (
		<img
			src={iconSrc}
			alt={channelName}
		/>
	);

	return (
		<XX
			id={tabId}
			path={path}
			icon={icon}
			title={channelName}
		/>
	);
}

function A({ id }) {
	const { path } = Store(state => state.getBookmark(id), shallow) || {};
	if (!path) return;
	const [, , , channelId, , threadId] = path.split("/");

	return (
		<D
			path={path}
			channelId={threadId || channelId}
		/>
	);
}

export default function BookmarkBar() {
	const bookmarks = Store(Store.selectors.bookmarks, (a, b) => a.length === b.length && !a.some((_, i) => a[i].id !== b[i].id));

	return (
		<div className="bookmarks-container">
			<div
				className="bookmarks-list"
				onDoubleClick={e => e.stopPropagation()}>
				{bookmarks.map(a => [
					<A
						key={a.id}
						id={a.id}
					/>
				])}
			</div>
		</div>
	);
}

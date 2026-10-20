// import "./styles"
import Plugin from "@common/Plugin";
// import React, { useMemo } from "@React";
// import ReadStateStore from "@Stores/ReadStateStore";
// import MessageStore from "@Stores/MessageStore";
// import { after } from "@common/Patcher";
// import { Filters, getDeclarationAndKey } from "@Webpack";
import { getUserName } from "@Utils/Discord";

import { create } from "@common/structs/zustand";
// import HoverPopout from "@Components/HoverPopout";
// import useStateFromStores from "@Modules/useStateFromStores";

// const DirectMessageTooltip = getDeclarationAndKey(Filters.bySource("__unsupportedReactNodeAsText", "DirectMessageTooltip"), Filters.byStrings("__unsupportedReactNodeAsText", "DirectMessageTooltip"));

// const MessageComponent = s(636922).exports.A;

// function DO({ channel }) {
// 	const unreadCount = useStateFromStores([], () => ReadStateStore.getUnreadCount(channel.id), [channel.id]);
// 	const unreadMessages = useMemo(() => {
// 		return MessageStore.getMessages(channel.id)._array.slice(-unreadCount);
// 	}, [channel.id, unreadCount]);

// 	return (
// 		<div className="do-popout">
// 			{unreadMessages.map(message => {
// 				return (
// 					<MessageComponent channel={channel} message={message} compact={!true}/>
// 				);
// 			})}
// 		</div>
// 	);
// }

// const Store = create(() => ({
// 	"size": 32,
// 	"tabMinWidth": 150,
// 	"tabWidth": 250,
// 	"showSettingsButton": true,
// 	"showTabbar": true,
// 	"showBookmarkbar": false,
// 	"keepTitle": false,
// 	"privacyMode": false,

// 	"bookmarkOverflowWrap": false,
// 	"ctrlClickChannel": true,

// 	"showTabUnreads": true,
// 	"showTabPings": true,
// 	"showTabTyping": true,
// 	"highlightTabUnread": true,

// 	"showBookmarkUnreads": true,
// 	"showBookmarkPings": true,
// 	"showBookmarkTyping": true,
// 	"highlightBookmarkUnread": true,

// 	"showFolderUnreads": true,
// 	"showFolderPings": true,
// 	"showFolderTyping": true,
// 	"highlightFolderUnread": true,

// 	"tabSwitch": false
// }));


// window.test = Store;
Plugin.onStart(() => {});

module.exports = () => Plugin;

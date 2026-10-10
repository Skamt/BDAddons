// import "./styles"
import Plugin from "@common/Plugin";
// import React, { useMemo } from "@React";
// import ReadStateStore from "@Stores/ReadStateStore";
// import MessageStore from "@Stores/MessageStore";
// import { after } from "@common/Patcher";
// import { Filters, getDeclarationAndKey } from "@Webpack";
// import { getUserName } from "@Utils/User";
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

Plugin.onStart(() => {
	// after(...DirectMessageTooltip, ({ args: [{ channel }], ret }) => {
	// 	// console.log(args,ret);

	// 	return (
	// 		<HoverPopout
	// 			spacing={12}
	// 			align="top"
	// 			position="right"
	// 			popout={() => <DO channel={channel} />}>
	// 			<div>{ret.props.children}</div>
	// 		</HoverPopout>
	// 	);
	// });
});

module.exports = () => Plugin;

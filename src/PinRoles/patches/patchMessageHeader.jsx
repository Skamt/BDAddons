import React from "@React";
import { Patcher } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";
import RolesList from "@/components/RolesList";
import Logger from "@Utils/Logger";

import { reRender } from "@Utils";
import Plugin, { Events } from "@Utils/Plugin";

import MessageHeader from "@Patch/MessageHeader";
console.log(MessageHeader)
Plugin.on(Events.START, () => {
	const { module, key } = MessageHeader;
	if (!module || !key) return Logger.patchError("MessageHeader");

	Patcher.after(module, key, (_, [props], ret) => {
		const { channel, message, compact, isRepliedMessage } = props;
		if(compact || isRepliedMessage) return;
		const guildId = channel?.guild_id;
		const userId = message?.author?.id;
		if (!userId || !guildId) return ret;

		console.log(props, ret.props);
		ret.props.children.push(<b>POOP</b>);
return ret;
		<ErrorBoundary>
			<RolesList
				guildId={guildId}
				userId={userId}
			/>
		</ErrorBoundary>;
	});
});

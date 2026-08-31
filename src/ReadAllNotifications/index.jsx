import "./styles";
import React from "@React";
import { Patcher } from "@Api";
import { Filters, getDeclarationAndKey } from "@Webpack";
import Button from "@Components/Button";
import GuildStore from "@Stores/GuildStore";
import GuildChannelStore from "@Stores/GuildChannelStore";
import ActiveJoinedThreadsStore from "@Stores/ActiveJoinedThreadsStore";
import ReadStateStore from "@Stores/ReadStateStore";
import Dispatcher from "@Modules/Dispatcher";
import Plugin, { Events } from "@Utils/Plugin";

function onClick() {
	const channels = [];

	// biome-ignore lint/complexity/noForEach: <explanation>
	Object.values(GuildStore.getGuilds()).forEach(guild => {
		// biome-ignore lint/complexity/noForEach: <explanation>
		GuildChannelStore.getChannels(guild.id)
			.SELECTABLE.concat(GuildChannelStore.getChannels(guild.id).VOCAL)
			.concat(Object.values(ActiveJoinedThreadsStore.getActiveJoinedThreadsForGuild(guild.id)).flatMap(threadChannels => Object.values(threadChannels)))
			.forEach(c => {
				if (!ReadStateStore.hasUnread(c.channel.id)) return;

				channels.push({
					channelId: c.channel.id,
					messageId: ReadStateStore.lastMessageId(c.channel.id),
					readStateType: 0
				});
			});
	});

	Dispatcher.dispatch({
		type: "BULK_ACK",
		context: "APP",
		channels: channels
	});
}

const ServerList = getDeclarationAndKey(Filters.bySource("guild-list-unread-dms"), Filters.byStrings(`"aria-owns":"guild-list-unread-dms"`));

const ReadAllButton = () => (
	<Button
		style={{display:"none"}}
		className="RAN-Button"
		size={Button.Sizes.TINY}
		look={Button.Looks.BLANK}
		color={Button.Colors.PRIMARY}
		onClick={onClick}>
		Read All
	</Button>
);

Plugin.on(Events.START, () => {
	const { module, key } = ServerList;
	if (!module || !key) return Logger.patchError("ServerList");

	Patcher.after(module, key, (_, args, ret) => {
		const children = Array.isArray(ret.props.children) ? ret.props.children : [ret.props.children];
		children.push(<ReadAllButton />);
		ret.props.children = children;
	});
});

Plugin.on(Events.STOP, () => {
	Patcher.unpatchAll();
});

module.exports = ()=>Plugin;

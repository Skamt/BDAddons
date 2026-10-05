import "./patches/*";
import Plugin from "@common/Plugin";
import { before } from "@common/Patcher";
import GuildStore from "@Stores/GuildStore";
import { Filters, getMangled } from "@Webpack";

const { MemberListItem } =
	getMangled(Filters.bySource("isOwner", "MEMBER_LIST_ITEM_AVATAR_DECORATION_PADDING"), {
		MemberListItem: a => typeof a === "object"
	}) || {};

Plugin.onStart(() => {
	before(MemberListItem, "type", ({ args: [props] }) => {
		const { guildId, user, isOwner } = props;
		props.isOwner = isOwner || GuildStore.getGuild(guildId)?.ownerId === user?.id;
	});
});

module.exports = () => Plugin;

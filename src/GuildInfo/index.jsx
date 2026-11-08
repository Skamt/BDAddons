import "./styles";
import { getDeclarationAndKey, Filters } from "@Webpack";
import { fit, parseSnowflake } from "@Utils";
import { ImageComponent } from "@Components/ImageModal";
import { openModal } from "@Utils/Modals";
import { getGuildIcon } from "@Utils/discord/Channel";
import GuildRoleStore from "@Stores/GuildRoleStore";
import GuildChannelStore from "@Stores/GuildChannelStore";
import GuildMemberCountStore from "@Stores/GuildMemberCountStore";
import { getGuildMemberName } from "@Utils/discord/User";
import React from "@React";
import Plugin from "@common/Plugin";
import { after } from "@common/Patcher";
import ContextMenu, { patch } from "@common/Patcher/contextmenu";

const GuildTooltip = getDeclarationAndKey(Filters.bySource("__unsupportedReactNodeAsText", "isViewingRoles"), Filters.byStrings("isViewingRoles"));

const el = (children, props) => (
	<div
		className="small"
		{...props}>
		{children}
	</div>
);

Plugin.onStart(() => {
	after(...GuildTooltip, ({ args: [{ guild }], ret }) => {
		ret.props.children.push(...[el(`Owner: ${getGuildMemberName(guild.id, guild.ownerId)}`), el(`OwnerId: ${guild.ownerId}`), el(`Created At: ${new Date(parseSnowflake(+guild.id)).toLocaleDateString()}`), el(`Joined At: ${guild.joinedAt?.toLocaleDateString()}`), el(`Roles: ${GuildRoleStore.getSortedRoles(guild.id).length}`), el(`Channels: ${GuildChannelStore.getChannels(guild.id).count}`), el(`Members: ${GuildMemberCountStore.getMemberCount(guild.id)}`)]);
	});

	patch("guild-context", (retVal, { guild }) => {
		if (!guild) return;
		const banner = getGuildIcon(guild.id, 4096);
		if (!banner) return;
		retVal.props.children.splice(
			1,
			0,
			ContextMenu.buildItem({
				label: "View logo",
				action: () =>
					openModal(
						<div>
							<ImageComponent
								url={banner}
								{...fit({ width: 4096, height: 4096 })}
							/>
						</div>
					)
			})
		);
	});
});

module.exports = () => Plugin;

import Logger from "@Utils/Logger";
import { getModule, getMangled, Filters } from "@Webpack";
import { Disposable, fit, parseSnowflake } from "@Utils";
import { ImageComponent } from "@Utils/ImageModal";
import { openModal } from "@Utils/Modals";
import { ContextMenu, Patcher, React } from "@Api";
import { getGuildIcon } from "@Utils/Channel";
import UserStore from "@Stores/UserStore";
import GuildRoleStore from "@Stores/GuildRoleStore";
import GuildMemberStore from "@Stores/GuildMemberStore";
import GuildChannelStore from "@Stores/GuildChannelStore";
import GuildMemberCountStore from "@Stores/GuildMemberCountStore";
import { getGuildMemberName } from "@Utils/User";

import GuildFeaturesEnum from "@Enums/GuildFeaturesEnum";

const GuildTooltip = getMangled(Filters.bySource("GuildTooltip"), {
	default: a => true
});

export default class GuildInfo extends Disposable {
	Init() {
		const el = (children, props) => (
			<div
				className="small"
				{...props}
			>
				{children}
			</div>
		);

		if (!GuildTooltip) return Logger.patchError("GuildInfo");
		this.patches = [
			Patcher.after(GuildTooltip, "default", (_, [{ guild }], ret) => {
				Patcher.after(ret.props.__unsupportedReactNodeAsText.props.children, "type", (__, ___, r) => {
					if (r.props.children.length > 3) return r;
					r.props.children.push(...[
						el(`Owner: ${getGuildMemberName(guild.id, guild.ownerId)}`), 
						el(`OwnerId: ${guild.ownerId}`), 
						el(`Created At: ${new Date(parseSnowflake(+guild.id)).toLocaleDateString()}`), 
						el(`Joined At: ${guild.joinedAt?.toLocaleDateString()}`), 
						el("Clyde", { style: { color: guild.features.has(GuildFeaturesEnum.CLYDE_ENABLED) ? "lime" : "red" } }), 
						el(`Roles: ${GuildRoleStore.getSortedRoles(guild.id).length}`), 
						el(`Channels: ${GuildChannelStore.getChannels(guild.id).count}`), 
						el(`Members: ${GuildMemberCountStore.getMemberCount(guild.id)}`)]);
				});
			}),

			ContextMenu.patch("guild-context", (retVal, { guild }) => {
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
			})
		];
	}
}

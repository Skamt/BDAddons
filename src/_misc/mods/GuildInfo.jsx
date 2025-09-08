import Logger from "@Utils/Logger";
import { getModule } from "@Webpack";
import { Disposable, fit, parseSnowflake } from "@Utils";
import { ImageComponent } from "@Utils/ImageModal";
import { openModal } from "@Utils/Modals";
import { ContextMenu, Patcher, React } from "@Api";

import GuildTooltip from "@Patch/GuildTooltip";

import UserStore from "@Stores/UserStore";
import GuildRoleStore from "@Stores/GuildRoleStore";
import GuildChannelStore from "@Stores/GuildChannelStore";
import GuildMemberCountStore from "@Stores/GuildMemberCountStore";

import GuildFeaturesEnum from "@Enums/GuildFeaturesEnum";

const { getGuildIconURL } = getModule(a => a.getGuildIconURL) || {};

export default class GuildInfo extends Disposable {
	Init() {
		const el = (children, props) => (
			<div
				className="small"
				{...props}>
				{children}
			</div>
		);

		const { module, key } = GuildTooltip;
		if (module && key)
			this.patches = [
				Patcher.after(module, key, (_, [{ guild }], ret) => {
					// console.log(guild);
					const owner = UserStore.getUser(guild.ownerId);
					ret.props.text = [ret.props.text, el(`Owner: ${owner?.globalName || owner?.username || guild.ownerId}`), el(`Created At: ${new Date(parseSnowflake(+guild.id)).toLocaleDateString()}`), el(`Joined At: ${guild.joinedAt.toLocaleDateString()}`), el("Clyde", { style: { color: guild.features.has(GuildFeaturesEnum.CLYDE_ENABLED) ? "lime" : "red" } }), el(`Roles: ${GuildRoleStore.getSortedRoles(guild.id).length}`), el(`Channels: ${GuildChannelStore.getChannels(guild.id).count}`), el(`Members: ${GuildMemberCountStore.getMemberCount(guild.id)}`)];
				}),
				ContextMenu.patch("guild-context", (retVal, { guild }) => {
					if (!guild || !getGuildIconURL) return;
					const banner = getGuildIconURL(guild);
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
		else Logger.patchError("GuildInfo");
	}
}

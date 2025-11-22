import Logger from "@Utils/Logger";
import { getModule, getMangled, Filters } from "@Webpack";
import { Disposable, fit, parseSnowflake } from "@Utils";
import { ImageComponent } from "@Utils/ImageModal";
import { openModal } from "@Utils/Modals";
import { ContextMenu, Patcher, React } from "@Api";

import UserStore from "@Stores/UserStore";
import GuildRoleStore from "@Stores/GuildRoleStore";
import GuildChannelStore from "@Stores/GuildChannelStore";
import GuildMemberCountStore from "@Stores/GuildMemberCountStore";
import { getUserName } from "@Utils/User";

import GuildFeaturesEnum from "@Enums/GuildFeaturesEnum";

const { getGuildIconURL } = getModule(a => a.getGuildIconURL) || {};

const GuildTooltip = getMangled(Filters.bySource("data-migration-pending", "GuildTooltip"), {
	default: Filters.byStrings("data-migration-pending")
});

export default class GuildInfo extends Disposable {
	Init() {
		const el = (children, props) => (
			<div
				className="small"
				{...props}>
				{children}
			</div>
		);

		if (!GuildTooltip) return Logger.patchError("GuildInfo");
		this.patches = [
			Patcher.after(GuildTooltip, "default", (_, [{ guild }], ret) => {
				const owner = UserStore.getUser(guild.ownerId);
				ret.props.text = [
					ret.props.text,
					el(`Owner: ${getUserName(owner)}`),
					el(`Created At: ${new Date(parseSnowflake(+guild.id)).toLocaleDateString()}`),
					el(`Joined At: ${guild.joinedAt.toLocaleDateString()}`),
					el("Clyde", { style: { color: guild.features.has(GuildFeaturesEnum.CLYDE_ENABLED) ? "lime" : "red" } }),
					el(`Roles: ${GuildRoleStore.getSortedRoles(guild.id).length}`),
					el(`Channels: ${GuildChannelStore.getChannels(guild.id).count}`),
					el(`Members: ${GuildMemberCountStore.getMemberCount(guild.id)}`)
				];
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
	}
}

import Logger from "@Utils/Logger";
import { getImageModalComponent, openModal, Disposable, parseSnowflake } from "@Utils";
import { ContextMenu, Patcher, React } from "@Api";

import GuildTooltip from "@Patch/GuildTooltip";

import UserStore from "@Stores/UserStore";
import GuildStore from "@Stores/GuildStore";
import GuildChannelStore from "@Stores/GuildChannelStore";
import GuildMemberCountStore from "@Stores/GuildMemberCountStore";

import GuildFeaturesEnum from "@Enums/GuildFeaturesEnum";

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
					ret.props.text = [ret.props.text, el(`Owner: ${owner?.globalName || owner?.username || guild.ownerId}`), el(`Created At: ${new Date(parseSnowflake(+guild.id)).toLocaleDateString()}`), el(`Joined At: ${guild.joinedAt.toLocaleDateString()}`), el("Clyde", { style: { color: guild.features.has(GuildFeaturesEnum.CLYDE_ENABLED) ? "lime" : "red" } }), el(`Roles: ${Object.keys(GuildStore.getRoles(guild.id)).length}`), el(`Channels: ${GuildChannelStore.getChannels(guild.id).count}`), el(`Members: ${GuildMemberCountStore.getMemberCount(guild.id)}`)];
				}),
				ContextMenu.patch("guild-context", (retVal, { guild }) => {
					if (!guild) return;
					const banner = guild.getIconURL(4096);
					if (!banner) return;
					retVal.props.children.splice(1,0,
						ContextMenu.buildItem({
							label: "View logo",
							action: () => openModal(<div>{getImageModalComponent(banner, { width:4096, height:4096 })}</div>)
							
						})
					);
				})
			];
		else Logger.patchError("GuildInfo");
	}
}

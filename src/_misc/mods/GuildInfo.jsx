import Logger from "@Utils/Logger";
import { Disposable, parseSnowflake } from "@Utils";
import { Patcher, React } from "@Api";

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

					ret.props.text = [
						ret.props.text,
						el(`Owner: ${UserStore.getUser(guild.ownerId)?.tag || guild.ownerId}`),
						el(`Created At: ${new Date(parseSnowflake(+guild.id)).toLocaleDateString()}`),
						el(`Joined At: ${guild.joinedAt.toLocaleDateString()}`),
						el("Clyde", { style: { color: guild.features.has(GuildFeaturesEnum.CLYDE_ENABLED) ? "lime" : "red" } }),
						el(`Roles: ${Object.keys(GuildStore.getRoles(guild.id)).length}`),
						el(`Channels: ${GuildChannelStore.getChannels(guild.id).count}`),
						el(`Members: ${GuildMemberCountStore.getMemberCount(guild.id)}`),
					]
				})
			];
		else
			Logger.patch("GuildInfo");
	}
}
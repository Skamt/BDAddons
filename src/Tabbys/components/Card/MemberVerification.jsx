import React from "@React";
import useStateFromStores from "@Modules/useStateFromStores";
import ChannelStore from "@Stores/ChannelStore";
import { getGuildIcon } from "@Utils/Channel";
import { join } from "@Utils/css";
import Settings from "@Utils/Settings";
import { getSize } from "@/utils";
import Markup from "./Markup";
import Icon from "./Icon";
import { IconsUtils } from "@Discord/Modules";

export default function MemberVerification({ icon, guildName, name, guildId }) {
	const { size } = getSize(Settings(_ => _.size));
	const title = name || guildName || guildId;
	const src = IconsUtils.getGuildIconURL({
		id: guildId,
		icon: icon,
		size
	});

	return (
		<Markup
			icon={
				<Icon
					size={size}
					src={src}
					alt={title}
				/>
			}
			title={title}
		/>
	);
}

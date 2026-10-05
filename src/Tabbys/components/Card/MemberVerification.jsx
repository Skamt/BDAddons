import React from "@React";
import Settings from "@Settings";
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

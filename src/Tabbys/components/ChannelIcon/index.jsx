import React from "@React";
import { getChannelIconURL } from "@Utils/Channel";
import { StarIcon } from "@Components/Icon";
import { Filters, reactRefMemoFilter, waitForComponent } from "@Webpack";
import Fallback from "./Fallback";
import UserAvatar from "@Components/UserAvatar";
import { join } from "@Utils/css";
import Settings from "@Utils/Settings";

const avatarSizes = {
	32: "SIZE_24",
	28: "SIZE_20",
	24: "SIZE_16"
};

const sizes = {
	32: 24,
	28: 20,
	24: 16
};

export default function ChannelIcon({ guildId, name, channel }) {
	const size = Settings(_ => _.size);

	if (!channel) return <Fallback />;

	let icon = null;
	if (guildId === "@favorites") icon = <StarIcon />;

	const src = getChannelIconURL(channel, size);
	if (!src) return <Fallback />;
	if (channel.isDM()) {
		return (
			<div className={join("card-icon", "user-avatar", "fcc")}>
				<UserAvatar
					id={channel.recipients[0]}
					src={src}
					size={avatarSizes[size]}
				/>
			</div>
		);
	}

	icon = (
		<img
			width={sizes[size]}
			height={sizes[size]}
			src={src}
			alt={name}
		/>
	);

	return <div className={join("card-icon", "icon-wrapper")}>{icon}</div>;
}

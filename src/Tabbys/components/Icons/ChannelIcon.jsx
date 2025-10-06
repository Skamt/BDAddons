import React from "@React";
import { getChannelIconURL } from "@Utils/Channel";
import { StarIcon } from "@Components/Icon";
import { Filters, reactRefMemoFilter, waitForComponent } from "@Webpack";
import Fallback from "./Fallback";
import UserAvatar from "@Components/UserAvatar";
import { join } from "@Utils/css";
import Settings from "@Utils/Settings";
import { getSize } from "./shared";

export default function ChannelIcon({ guildId, name, channel }) {
	const { size } = getSize(Settings(_ => _.size));
	const src = getChannelIconURL(channel, size);

	if (!src) return <Fallback />;
	return (
		<div className={join("card-icon", "icon-wrapper")}>
			<img
				width={size}
				height={size}
				src={src}
				alt={name}
			/>
		</div>
	);
}

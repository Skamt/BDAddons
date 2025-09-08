import React from "@React";
import { getChannelIcon } from "@Utils/Channel";
import { DiscordIcon } from "@Components/Icon";
import Fallback from "./Fallback";

export default function BookmarkIcon({ name, channel, size = 24 }) {
	if (!channel) return <Fallback />;

	const src = getChannelIcon(channel, size);

	return src ? (
		<img
			width={size}
			height={size}
			src={src}
			alt={name}
		/>
	) : (
		<Fallback />
	);
}

import React from "@React";
import { getChannelIconURL } from "@Utils/Channel";
import { Filters, reactRefMemoFilter, waitForComponent } from "@Webpack";
import Fallback from "./Fallback";
import UserAvatar from "@Components/UserAvatar";
const GroupDMAvatar = waitForComponent(Filters.byStrings("recipients", "backSrc"));

const sizes = {
	16: "SIZE_16",
	20: "SIZE_20",
	24: "SIZE_24",
	32: "SIZE_32",
	40: "SIZE_40",
	44: "SIZE_44",
	48: "SIZE_48",
	56: "SIZE_56",
	80: "SIZE_80"
};

export default function ChannelIcon({ name, channel, size = 24 }) {
	if (!channel) return <Fallback />;

	if (channel.isGroupDM() && !channel.icon)
		return (
			<GroupDMAvatar
				recipients={channel.recipients}
				size={sizes[size]}
			/>
		);

	const src = getChannelIconURL(channel, size);

	if (channel.isDM())
		return (
			<UserAvatar
				id={channel.recipients[0]}
				src={src}
				size={sizes[size]}
			/>
		);

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

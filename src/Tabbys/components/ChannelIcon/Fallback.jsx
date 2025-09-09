import React from "@React";
import { DiscordIcon } from "@Components/Icon";
import { join } from "@Utils/String";

export default function FallbackIcon({ className }) {
	return (
		<div className={join(" ", "discord-icon", "icon-wrapper", className)}>
			<DiscordIcon />
		</div>
	);
}

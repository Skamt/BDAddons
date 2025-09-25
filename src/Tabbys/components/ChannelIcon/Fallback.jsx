import React from "@React";
import { join } from "@Utils/css";
import { DiscordIcon } from "@Components/Icon";

export default () => (
	<div className={join("card-icon", "discord-icon", "icon-wrapper")}>
		<DiscordIcon />
	</div>
);

import React from "@React";
import { SettingIcon } from "@Components/icon";
import Tooltip from "@Components/Tooltip";
import { ManaButton } from "@Components/Button";
import { join } from "@Utils/String";
import Popout from "@Components/Popout";
import { ContextMenu } from "@Api";
import SettingsContextMenu from "@/contextmenus/SettingsContextMenu";

export default function SettingsButton() {
	return (
		<Popout
			position="bottom"
			align="center"
			spacing={12}
			renderPopout={e => <SettingsContextMenu {...e} />}>
			{e => {
				return (
					<div
						{...e}
						className={join(" ", "icon-wrapper", "tabbys-app-settings-button")}>
						<Tooltip note="Settings">
							<SettingIcon />
						</Tooltip>
					</div>
				);
			}}
		</Popout>
	);
}

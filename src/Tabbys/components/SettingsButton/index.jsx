import React from "@React";
import { SettingIcon } from "@Components/icon";
import Tooltip from "@Components/Tooltip";
import { ManaButton } from "@Components/Button";

export default function SettingsButton() {
	return (
		<Tooltip note="Settings">
			<div className="tabbys-app-settings-button">
				<SettingIcon
					width="20"
					height="20"
				/>
			</div>
			{/*<ManaButton
				variant="icon-only"
				size="xs"
				icon={() => (
					<SettingIcon
						width="18"
						height="18"
					/>
				)}
			/>*/}
		</Tooltip>
	);
}

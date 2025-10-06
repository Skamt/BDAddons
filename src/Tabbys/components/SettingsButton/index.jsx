import React from "@React";
import config from "@Config";
import { SettingIcon } from "@Components/icon";
import Tooltip from "@Components/Tooltip";
import { ManaButton } from "@Components/Button";
import { join } from "@Utils/String";
import Popout from "@Components/Popout";
import { ContextMenu } from "@Api";
import SettingsContextMenu from "@/contextmenus/SettingsContextMenu";
import zustand from "@Discord/zustand";

export const SettingsButtonStore = zustand((set, get) => ({
	isOpen: false,
	open: () => set({ isOpen: true }),
	close: () => set({ isOpen: false })
}));

export default function SettingsButton() {
	return (
		<Popout
			position="bottom"
			align="center"
			spacing={12}
			onRequestOpen={()=> SettingsButtonStore.getState().open()}
			onRequestClose={()=> SettingsButtonStore.getState().close()}
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

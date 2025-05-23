import { SettingIcon } from "@Components/Icon";
import { DiscordPopout } from "@Discord/Modules";
import React, {useRef} from "@React";
import SettingComponent from "@/components/SettingComponent";
export default React.memo(function SettingsDropdown() {
	const ref = useRef();
	return (
		<DiscordPopout
			position="bottom"
			align="right"
			targetElementRef={ref}
			animation={1}
			spacing={8}
			renderPopout={() => (
				<div className="settings-dropdown">
					<SettingComponent />
				</div>
			)}>
			{e => {
				return (
					// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
					<div
						ref={ref}
						onClick={e.onClick}
						className="settings-dropdown-btn flex-center">
						<SettingIcon className="parent-dim" />
					</div>
				);
			}}
		</DiscordPopout>
	);
});

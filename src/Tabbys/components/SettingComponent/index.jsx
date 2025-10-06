import config from "@Config";
import React from "@React";
import Collapsible from "@Components/Collapsible";
import Gap from "@Components/Gap";
import SettingSwtich from "@Components/SettingSwtich";
import { RadioGroup } from "@Discord/Modules";
import Settings from "@Utils/Settings";
import Plugin from "@Utils/Plugin";
import Heading from "@Modules/Heading";
import Slider from "@Modules/Slider";
import FieldSet from "@Components/FieldSet";
import Divider from "@Components/Divider";

function SettingSlider({ settingKey, label, description, ...props }) {
	const [val, set] = Settings.useSetting(settingKey);
	const beautify = e => `${Math.round(e)}px`;
	return (
		<Slider
			{...props}
			mini={true}
			label={label}
			description={description}
			initialValue={val}
			onValueChange={e => set(Math.round(e))}
			onValueRender={beautify}
		/>
	);
}

export default function SettingComponent() {
	return (
		<div className={`${config.info.name}-settings`}>
			<Collapsible title="Appearence">
				<Collapsible title="toggles">
					<FieldSet contentGap={8}>
						{[
							{ description: "Show/Hide Tabbar", settingKey: "showTabbar" },
							{ description: "Show/Hide Bookmarkbar", settingKey: "showBookmarkbar" },
							{ description: "Show/Hide Titlebar", settingKey: "keepTitle" },
							{ description: "Show/Hide privacy mode", settingKey: "privacyMode" },
							{ description: "Show/Hide SettingsButton", settingKey: "showSettingsButton" }
						].map(SettingSwtich)}
					</FieldSet>
				</Collapsible>
				<Divider gap={15} />
				<SettingSlider
					settingKey="size"
					label="UI Size"
					description="overall scale for the entire UI"
					minValue={24}
					maxValue={32}
					markers={[24, 28, 32]}
				/>
				<Divider gap={25} />
				<SettingSlider
					settingKey="tabWidth"
					label="Tab width"
					description="width a tab will take when there is enough space"
					minValue={50}
					maxValue={250}
					markers={[50, 100, 150, 200, 250]}
				/>
				<Divider gap={25} />
				<SettingSlider
					settingKey="tabMinWidth"
					label="Tab min width"
					description="width at which a tab will stop shrinking when there is too many tabs"
					minValue={50}
					maxValue={250}
					markers={[50, 100, 150, 200, 250]}
				/>
			</Collapsible>
			<Gap gap={15} />

			<Collapsible title="Status">
				{["Tab", "Bookmark", "Folder"].map(type => {
					return (
						<Collapsible title={type}>
							{[
								{ description: "Unreads", settingKey: `show${type}Unreads` },
								{ description: "Pings", settingKey: `show${type}Pings` },
								{ description: "Typing", settingKey: `show${type}Typing` }
							].map(props => [SettingSwtich({ ...props, hideBorder: true, style: { marginBottom: 5 } }), <Gap gap={5} />])}
						</Collapsible>
					);
				})}
			</Collapsible>
		</div>
	);
}

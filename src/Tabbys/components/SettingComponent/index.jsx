import config from "@Config";
import React from "@React";
import Collapsible from "@Components/Collapsible";
import Gap from "@Components/Gap";
import SettingSwtich from "@Components/SettingSwtich";
import SettingSlider from "@Components/SettingSlider";
import Settings from "@Utils/Settings";
import Plugin from "@Utils/Plugin";
import Heading from "@Modules/Heading";
import Slider from "@Modules/Slider";
import FieldSet from "@Components/FieldSet";
import Divider from "@Components/Divider";
import {valueToPx} from "@/utils";



export default function SettingComponent() {
	return (
		<div className={`${config.info.name}-settings`}>
			<FieldSet contentGap={10}>
				<Collapsible title="Appearence">
					<Collapsible title="toggles">
						<FieldSet contentGap={8}>
							{[
								{ border: true, description: "Wrap Bookmarks", note: "Wrap overflowing bookmarks instead of clamping them into a overflow menu", settingKey: "bookmarkOverflowWrap" },
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
						onValueRender={valueToPx}
					/>
					<Divider gap={25} />
					<SettingSlider
						settingKey="tabWidth"
						label="Tab width"
						description="width a tab will take when there is enough space"
						minValue={50}
						maxValue={250}
						markers={[50, 100, 150, 200, 250]}
						onValueRender={valueToPx}
					/>
					<Divider gap={25} />
					<SettingSlider
						settingKey="tabMinWidth"
						label="Tab min width"
						description="width at which a tab will stop shrinking when there is too many tabs"
						minValue={50}
						maxValue={250}
						markers={[50, 100, 150, 200, 250]}
						onValueRender={valueToPx}
					/>
				</Collapsible>

				<Collapsible title="Status">
					{["Tab", "Bookmark", "Folder"].map(type => {
						return (
							<Collapsible
								key={type}
								title={type}>
								<FieldSet contentGap={5}>
									{[
										{ description: "Unreads", settingKey: `show${type}Unreads` },
										{ description: "Pings", settingKey: `show${type}Pings` },
										{ description: "Typing", settingKey: `show${type}Typing` },
										{ description: "Highlight Unread", settingKey: `highlight${type}Unread` }
									].map(SettingSwtich)}
								</FieldSet>
							</Collapsible>
						);
					})}
				</Collapsible>

				<Collapsible title="Functionality">
					<FieldSet contentGap={8}>
						{[
							{ settingKey: "ctrlClickChannel", description: "Ctrl+Click Channel to open in new tab" },
							{ settingKey: "bookmarkOverflowWrap", description: "Wrap Bookmarks", note: "Wrap overflowing bookmarks instead of clamping them into a overflow menu" }
						].map(SettingSwtich)}
					</FieldSet>
				</Collapsible>
			</FieldSet>
		</div>
	);
}

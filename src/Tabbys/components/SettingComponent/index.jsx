import config from "@Config";
import React from "@React";
import Collapsible from "@Components/Collapsible";
import SettingSwtich from "@Components/SettingSwtich";
import SettingSlider from "@Components/SettingSlider";
import FieldSet from "@Components/FieldSet";
import Divider from "@Components/Divider";
import { valueToPx } from "@/utils";
import Settings from "@Settings";

export default function SettingComponent() {
	return (
		<div className={`${config.info.name}-settings`}>
			<FieldSet contentGap={10}>
				<Collapsible title="Appearence">
					<Collapsible title="toggles">
						<FieldSet contentGap={8}>
							{[
								{ border: true, description: "Wrap Bookmarks", setting: Settings.bookmarkOverflowWrap, note: "Wrap overflowing bookmarks instead of clamping them into a overflow menu" },
								{ description: "Show/Hide Tabbar", setting: Settings.showTabbar },
								{ description: "Show/Hide Bookmarkbar", setting: Settings.showBookmarkbar },
								{ description: "Show/Hide Titlebar", setting: Settings.keepTitle },
								{ description: "Show/Hide privacy mode", setting: Settings.privacyMode },
								{ description: "Show/Hide SettingsButton", setting: Settings.showSettingsButton }
							].map(SettingSwtich)}
						</FieldSet>
					</Collapsible>
					<Divider gap={15} />
					<SettingSlider
						setting={Settings.size}
						label="UI Size"
						description="overall scale for the entire UI"
						minValue={24}
						maxValue={32}
						markers={[24, 28, 32]}
						onValueRender={valueToPx}
					/>
					<Divider gap={25} />
					<SettingSlider
						setting={Settings.tabWidth}
						label="Tab width"
						description="width a tab will take when there is enough space"
						minValue={50}
						maxValue={250}
						markers={[50, 100, 150, 200, 250]}
						onValueRender={valueToPx}
					/>
					<Divider gap={25} />
					<SettingSlider
						setting={Settings.tabMinWidth}
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
										{ description: "Unreads", setting: Settings[`show${type}Unreads`] },
										{ description: "Pings", setting: Settings[`show${type}Pings`] },
										{ description: "Typing", setting: Settings[`show${type}Typing`] },
										{ description: "Highlight Unread", setting: Settings[`highlight${type}Unread`] }
									].map(SettingSwtich)}
								</FieldSet>
							</Collapsible>
						);
					})}
				</Collapsible>

				<Collapsible title="Functionality">
					<FieldSet contentGap={8}>
						{[
							{ setting: Settings.ctrlClickChannel, description: "Ctrl+Click Channel to open in new tab" },
							{ setting: Settings.bookmarkOverflowWrap, description: "Wrap Bookmarks", note: "Wrap overflowing bookmarks instead of clamping them into a overflow menu" },
							{ setting: Settings.tabSwitch, description: "Enable switch keybinds", note: "Switch between channels using keybinds --  switch right [Ctrl+Tab] / switch left [Ctrl+Shift+Tab]" }
						].map(SettingSwtich)}
					</FieldSet>
				</Collapsible>
			</FieldSet>
		</div>
	);
}

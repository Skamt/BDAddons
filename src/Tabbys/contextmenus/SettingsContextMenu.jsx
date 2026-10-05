import config from "@Config";
import SettingSlider from "@Components/SettingSlider";
import { valueToPx } from "@/utils";
import { ContextMenu } from "@Api";
import React from "@React";
import Settings from "@Settings";
import { classNameFactory } from "@Utils/css";
const c = classNameFactory(`${config.info.name}-menuitem`);

const { Separator, CheckboxItem, ControlItem, Item, Menu } = ContextMenu;

function ContextMenuToggle({ setting, label, color }) {
	const state = Settings(setting.get);
	return (
		<CheckboxItem
			color={color}
			label={label}
			id={c(label, setting.key)}
			checked={state}
			action={() => setting.set(!state)}
		/>
	);
}

function ContextMenuSlider({ setting, label, ...rest }) {
	const val = Settings(setting.get);

	return (
		<ControlItem
			id={c(setting.key)}
			label={`${label}: ${val}px`}
			control={() => (
				<div style={{ padding: "0 8px" }}>
					<SettingSlider
						{...rest}
						setting={setting}
						onValueRender={valueToPx}
					/>
				</div>
			)}
		/>
	);
}

function status() {
	function genStatusToggles(type) {
		return (
			<Item
				label={type}
				id={c(type)}>
				{[
					{ setting: Settings[`show${type}Pings`], label: "Pings" },
					{ setting: Settings[`show${type}Unreads`], label: "Unreads" },
					{ setting: Settings[`show${type}Typing`], label: "Typings" },
					{ setting: Settings[`highlight${type}Unread`], label: "Highlight Unread" }
				].map(ContextMenuToggle)}
			</Item>
		);
	}

	return (
		<Item
			label="Status"
			id={c("status")}>
			{genStatusToggles("Tab")}
			{genStatusToggles("Bookmark")}
			{genStatusToggles("Folder")}
		</Item>
	);
}

function appearence() {
	return (
		<Item
			label="Appearence"
			id={c("appearence")}>
			{[
				{
					setting: Settings.size,
					label: "UI Size",
					minValue: 24,
					maxValue: 32
				},
				{
					label: "Tab width",
					setting: Settings.tabWidth,
					minValue: 50,
					maxValue: 250
				},
				{
					label: "Tab min width",
					setting: Settings.tabMinWidth,
					minValue: 50,
					maxValue: 250
				}
			].map(ContextMenuSlider)}

			<Separator />

			{[
				{ setting: Settings.showTabbar, label: "Show Tabbar" },
				{ setting: Settings.showBookmarkbar, label: "Show Bookmarks" },
				{ setting: Settings.keepTitle, label: "Keep TitleBar" },
				{ setting: Settings.privacyMode, label: "Privacy Mode" },
				{ setting: Settings.showSettingsButton, label: "Show Settings button", color: "danger" }
			].map(ContextMenuToggle)}
		</Item>
	);
}

export default function () {
	return (
		<Menu>
			{appearence()}
			{status()}
			<Item
				label="Functionality"
				id={c("functionality")}>
				{[
					{ setting: Settings.bookmarkOverflowWrap, label: "Wrap Bookmarks" },
					{ setting: Settings.ctrlClickChannel, label: "Ctrl+Click channel" },
					{ setting: Settings.tabSwitch, label: "Tab switch keybinds" }
				].map(ContextMenuToggle)}
			</Item>
		</Menu>
	);
}

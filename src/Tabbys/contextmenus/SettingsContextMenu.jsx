import Store from "@/Store";
import config from "@Config";
import SettingSlider from "@Components/SettingSlider";
import { valueToPx } from "@/utils";
import { ContextMenu } from "@Api";
import { CloseIcon, PenIcon, PlusIcon } from "@Components/Icon";
import React, { useState } from "@React";
import Settings from "@Utils/Settings";
import { classNameFactory } from "@Utils/css";
const c = classNameFactory(`${config.info.name}-menuitem`);

const { Separator, CheckboxItem, RadioItem, ControlItem, Group, Item, Menu } = ContextMenu;

import Slider from "@Modules/Slider";

function ContextMenuToggle({ settingKey, label, color }) {
	const [state, setState] = useState(Settings.state[settingKey]);
	return (
		<CheckboxItem
			color={color}
			label={label}
			id={c(label, settingKey)}
			checked={state}
			action={() => {
				setState(!state);
				Settings[`set${settingKey}`](!Settings.state[settingKey]);
			}}
		/>
	);
}

function ContextMenuSlider({ settingKey, label, ...rest }) {
	const [val] = Settings.useSetting(settingKey);

	return (
		<ControlItem
			id={c(settingKey)}
			label={`${label}: ${val}px`}
			control={() => (
				<div style={{ padding: "0 8px" }}>
					<SettingSlider
						{...rest}
						settingKey={settingKey}
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
			<>
				<Item
					label={`${type}:`}
					id={c(type)}
					disabled={true}
				/>
				{[
					{ settingKey: `show${type}Pings`, label: "Pings" },
					{ settingKey: `show${type}Unreads`, label: "Unreads" },
					{ settingKey: `show${type}Typing`, label: "Typings" },
					{ settingKey: `highlight${type}Unread`, label: "Highlight Unread" }
				].map(ContextMenuToggle)}
			</>
		);
	}

	return (
		<Item
			label="Status"
			id={c("status")}>
			{genStatusToggles("Tab")}
			<Separator />
			{genStatusToggles("Bookmark")}
			<Separator />
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
					settingKey: "size",
					label: "UI Size",
					minValue: 24,
					maxValue: 32
				},
				{
					label: "Tab width",
					settingKey: "tabWidth",
					minValue: 50,
					maxValue: 250
				},
				{
					label: "Tab min width",
					settingKey: "tabMinWidth",
					minValue: 50,
					maxValue: 250
				}
			].map(ContextMenuSlider)}

			<Separator />

			{[
				{ settingKey: "showTabbar", label: "Show Tabbar" },
				{ settingKey: "showBookmarkbar", label: "Show Bookmarks" },
				{ settingKey: "keepTitle", label: "Keep TitleBar" },
				{ settingKey: "privacyMode", label: "Privacy Mode" },
				{ settingKey: "showSettingsButton", label: "Show Settings button", color: "danger" }
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
					{ settingKey: "bookmarkOverflowWrap", label: "Wrap Bookmarks" },
					{ settingKey: "ctrlClickChannel", label: "Ctrl+Click channel" }
				].map(ContextMenuToggle)}
			</Item>
		</Menu>
	);
}

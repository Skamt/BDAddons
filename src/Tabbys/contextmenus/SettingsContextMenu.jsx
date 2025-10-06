import Store from "@/Store";
import config from "@Config";
// import { openValueModal } from "@/components/ValueModal";
import { ContextMenu } from "@Api";
import { CloseIcon, PenIcon, PlusIcon } from "@Components/Icon";
import React, { useState } from "@React";
import Settings from "@Utils/Settings";
import { classNameFactory } from "@Utils/css";
const c = classNameFactory(`${config.info.name}-menuitem`);

const { Separator, CheckboxItem, RadioItem, ControlItem, Group, Item, Menu } = ContextMenu;

import Slider from "@Modules/Slider";

function buildToggle({ key, label, color }) {
	const [state, setState] = useState(Settings.state[key]);
	return (
		<CheckboxItem
			color={color}
			label={label}
			id={c(label, key)}
			checked={state}
			action={() => {
				setState(!state);
				Settings.state[`set${key}`](!Settings.state[key]);
			}}
		/>
	);
}

function ContextMenuSlider({ key, label, ...rest }) {
	const [val, set] = Settings.useSetting(key);

	const beautify = e => `${Math.round(e)}px`;
	return (
		<ControlItem
			id={c(key)}
			label={`${label}: ${val}px`}
			control={() => (
				<div style={{ padding: "0 8px" }}>
					<Slider
						{...rest}
						mini={true}
						initialValue={val}
						onValueChange={e => set(Math.round(e))}
						onValueRender={beautify}
					/>
				</div>
			)}
		/>
	);
}

function status() {
	function d(type) {
		return (
			<>
				<Item
					label={`${type}:`}
					id={c(type)}
					disabled={true}
				/>
				{[
					{ key: `show${type}Pings`, label: "Pings" },
					{ key: `show${type}Unreads`, label: "Unreads" },
					{ key: `show${type}Typing`, label: "Typings" }
				].map(buildToggle)}
			</>
		);
	}

	return (
		<>
			{d("Tab")}
			<Separator />
			{d("Bookmark")}
			<Separator />
			{d("Folder")}
		</>
	);
}

function appearence() {
	return (
		<Item
			label="Appearence"
			id={c("appearence")}>
			{[
				{
					key: "size",
					label: "UI Size",
					minValue: 24,
					maxValue: 32
				},
				{
					label: "Tab width",
					key: "tabWidth",
					minValue: 50,
					maxValue: 250
				},
				{
					label: "Tab min width",
					key: "tabMinWidth",
					minValue: 50,
					maxValue: 250
				}
			].map(ContextMenuSlider)}

			<Separator />
			{[
				{ key: "showTabbar", label: "Show Tabbar" },
				{ key: "showBookmarkbar", label: "Show Bookmarks" },
				{ key: "keepTitle", label: "Keep TitleBar" },
				{ key: "privacyMode", label: "Privacy Mode" },
				{ key: "showSettingsButton", label: "Show Settings button", color: "danger" }
			].map(buildToggle)}
		</Item>
	);
}

export default function () {
	return (
		<Menu>
			{appearence()}
			<Item
				label="Status"
				id={c("status")}>
				{status()}
			</Item>
		</Menu>
	);
}

import "./styles";
import { Store } from "@/Store";
import { buildTab } from "@/utils";
import { PlusIcon } from "@Components/Icon";
import React from "@React";
import Tab from "../Tab";
import TabsScroller from "../TabsScroller";
import SettingsContextMenu from "@/contextmenus/SettingsContextMenu";
import { ContextMenu } from "@Api";

export default function TabBar({ leading, trailing }) {
	console.log("TabBar rendered");
	const tabs = Store(Store.selectors.tabs, (a, b) => a.length === b.length && !a.some((_, i) => a[i].id !== b[i].id));

	// const selectedTab = Store.state.getCurrentlySelectedTab();

	const newTabHandler = e => {
		e.preventDefault();
		e.stopPropagation();
		console.log(e);
		// e.stopImmediatePropagation();
		Store.state.newTab(buildTab({ path: "/channels/@me" }));
	};

	const contextmenuHandler = e => {
		ContextMenu.open(e, SettingsContextMenu(), {
			position: "bottom",
			align: "center"
		});
	};

	return (
		<div className="tabbar flex">
			{leading}
			<div
				className="tabs-container flex-center"
				onDoubleClick={e => e.stopPropagation()}>
				<TabsScroller>
					{tabs.map((a, index) => [
						index !== 0 && <div className="tab-div" />,
						<Tab
							key={a.id}
							id={a.id}
						/>
					])}
				</TabsScroller>
				<div className="tab-div" />
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
				<div
					className="new-tab flex-center round"
					onClick={newTabHandler}>
					<PlusIcon className="parent-dim" />
				</div>
			</div>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			{/*<div
				onClick={contextmenuHandler}
				className="settings-dropdown flex-center">
				<PlusIcon className="parent-dim" />
			</div>*/}
			{trailing}
		</div>
	);
}

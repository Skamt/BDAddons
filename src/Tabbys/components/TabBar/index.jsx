import "./styles";
import { Store } from "@/Store";
import { buildTab } from "@/utils";
import { PlusIcon } from "@Components/Icon";
import React, { useRef } from "@React";
import Tab from "../Tab";
import TabsScroller from "../TabsScroller";

import Settings from "@Utils/Settings";
import { concateClassNames } from "@Utils";
import { DropTarget } from "@Discord/Modules";

function DragThis(comp) {
	return DropTarget(
		"BOOKMARK",
		{
			drop(_, monitor) {
				const droppedBookmark = monitor.getItem();
				const path = droppedBookmark.path;
				if (!path) return;
				Store.state.newTab(buildTab({ path }));
			}
		},
		(connect, monitor) => {
			return {
				isOver: monitor.isOver(),
				canDrop: monitor.canDrop(),
				dropRef: connect.dropTarget()
			};
		}
	)(comp);
}

export default DragThis(function TabBar({ isOver, canDrop, dropRef, leading, trailing }) {
	const tabs = Store(Store.selectors.tabs, (a, b) => a.length === b.length && !a.some((_, i) => a[i].id !== b[i].id));
	const showTabDivider = Settings(Settings.selectors.showTabDivider);
	const tabsContainerRef = useRef();
	dropRef(tabsContainerRef);

	const newTabHandler = e => {
		e.preventDefault();
		e.stopPropagation();
		Store.state.newTab(buildTab({ path: "/channels/@me" }));
	};

	return (
		<div className="tabbar flex">
			{leading}
			<div
				className={concateClassNames("tabs-container flex-center", canDrop && isOver && "candrop")}
				ref={tabsContainerRef}
				onDoubleClick={e => e.stopPropagation()}>
				<TabsScroller>
					{tabs.map((a, index, list) => [
						showTabDivider && index !== 0 && <div className="tab-div" />,
						<Tab
							isSingle={list.length === 1}
							key={a.id}
							id={a.id}
						/>
					])}
				</TabsScroller>
				<div className="new-tab-div" />
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
				<div
					className="new-tab flex-center round"
					onClick={newTabHandler}>
					<PlusIcon className="parent-dim" />
				</div>
			</div>
			
			{trailing}
		</div>
	);
});

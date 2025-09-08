import "./styles";
import React, { useEffect, useState } from "@React";
import { PlusIcon } from "@Components/Icon";
import TabsScroller from "@/components/TabsScroller";
import Tab from "@/components/Tab";
import Store from "@/Store";
import { clsx } from "@Utils";

const c = clsx("tabbar");

export default function TabBar() {
	const tabs = Store(Store.selectors.tabs, (a, b) => a.length === b.length && !a.some((_, i) => a[i].id !== b[i].id));
	const selectedId = Store(Store.selectors.selectedId);
	const selectedIndex = Store.getSelectedTabIndex();

	const newTabHandler = e => {
		e.preventDefault();
		e.stopPropagation();
		Store.newTab();
	};

	return (
		<div className={c("container")}>
			<TabsScroller
				shouldScroll={selectedId}
				scrollTo={selectedIndex}
				containerClassName={c("tabs-scroller-container")}
				contentClassName={c("tabs-scroller-content")}
				items={tabs}
				renderItem={({ id }) => (
					<Tab
						key={id}
						id={id}
					/>
				)}
			/>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<div
				className={c("new-tab")}
				onClick={newTabHandler}>
				<PlusIcon />
			</div>
		</div>
	);
}

import "./styles";
import { Store } from "@/Store";
import PlusIcon from "@Components/icons/PlusIcon";

import React from "@React";
import Tab from "../Tab";
import TabsScroller from "../TabsScroller";

export default function App() {
	console.log("TabBar rendered");
	const tabs = Store(Store.selectors.tabs, (a, b) => a.length === b.length && !a.some((_, i) => a[i].id !== b[i].id));

	// const selectedTab = Store.state.getCurrentlySelectedTab();

	const newTabHandler = e => {
		e.preventDefault();
		e.stopPropagation();
		console.log(e);
		// e.stopImmediatePropagation();
		Store.state.newTab();
	};

	return (
		<div
			className="tabs-container"
			onDoubleClick={e => e.stopPropagation()}>
			<TabsScroller>
				{[...tabs].map(a => (
					<Tab
						key={a.id}
						id={a.id}
					/>
				))}
			</TabsScroller>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<div
				className="new-tab"
				onClick={newTabHandler}>
				<PlusIcon />
			</div>
		</div>
	);
}

import React from "@React";
import { Store } from "@/Store";
import BaseTab from "./BaseTab";

export default function GenericTab({ tabId, path }) {
	const selected = Store(state => state.selectedId === tabId);
	return (
		<BaseTab
			id={tabId}
			path={path}
			selected={selected}
		/>
	);
}

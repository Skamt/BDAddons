import { Store } from "@/Store";
import CloseIcon from "@Components/icons/CloseIcon";
import React from "@React";
import { concateClassNames } from "@Utils";


export default function BaseTab({ id, path, selected, icon, title }) {

	const clickHandler = () => {
		Store.state.setSelectedId(id);
		return console.log(id, "clickHandler");
	};

	const closeHandler = e => {
		e.stopPropagation();
		Store.state.removeTab(id);
		return console.log(id, "closeHandler");
	};

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
		<div
			className={concateClassNames("tab", selected && "selected-tab")}
			onClick={clickHandler}>
			<div className="tab-icon">{icon}</div>
			<div className="tab-title">{title || path}</div>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<div
				className="tab-close"
				onClick={closeHandler}>
				<CloseIcon />
			</div>
		</div>
	);
}

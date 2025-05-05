import { Store } from "@/Store";
import CloseIcon from "@Components/icons/CloseIcon";
import React from "@React";
import { concateClassNames } from "@Utils";
import DiscordIcon from "@Components/icons/DiscordIcon";

export default function BaseTab({ id, path, selected, icon, title }) {
	const isSingleTab = Store(state => state.tabs.length === 1);

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
			onClick={!selected && clickHandler}>
			<div className="tab-icon">
				{icon || (
					<div className="tab-icon-unknown">
						<DiscordIcon />
					</div>
				)}
			</div>
			<div className="tab-title">{title || path}</div>
			{!isSingleTab && (
				// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
				<div
					className="tab-close"
					onClick={closeHandler}>
					<CloseIcon />
				</div>
			)}
		</div>
	);
}

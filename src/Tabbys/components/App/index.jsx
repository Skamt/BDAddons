import config from "@Config";
import "./styles";
import React from "@React";
import Settings from "@Utils/Settings";
import BookmarkBar from "../BookmarkBar";
import TabBar from "../TabBar";
import SettingsDropdown from "./SettingsDropdown";

export default function App({ leading, trailing }) {
	const showTabbar = Settings(Settings.selectors.showTabbar);
	const showBookmarkbar = Settings(Settings.selectors.showBookmarkbar);
	const showSettingsButton = Settings(Settings.selectors.showSettingsButton);
	// if (showSettingsButton) {
	// 	trailing = React.cloneElement(trailing,{
	// 		children:[<SettingsDropdown />, ...trailing.props.children]
	// 	});		
	// }
	return (
		<div className={`${config.info.name}-container Tabbys-vars`}>
			{showTabbar && (
				<TabBar
					// leading={leading}
					// trailing={trailing}
				/>
			)}
			{showTabbar && showBookmarkbar && <div className={`${config.info.name}-divider`} />}
			{showBookmarkbar && (
				<BookmarkBar
					// leading={!showTabbar && leading}
					// trailing={!showTabbar && trailing}
				/>
			)}
		</div>
	);
}

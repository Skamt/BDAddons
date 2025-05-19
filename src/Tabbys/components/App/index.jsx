import "./styles";
import React from "@React";
import TabBar from "../TabBar";
import BookmarkBar from "../BookmarkBar";
import Settings from "@Utils/Settings";

export default function App({ leading, trailing }) {
	const size = Settings(Settings.selectors.size);
	const showTabbar = Settings(Settings.selectors.showTabbar);
	const showBookmarkbar = Settings(Settings.selectors.showBookmarkbar);
	return (
		<div style={{ "--size": `${size}px` }} className={`${config.info.name}-container Tabbys-vars`}>
			{showTabbar && <TabBar leading={leading} trailing={trailing}  />}
			{showTabbar && showBookmarkbar && <div className={`${config.info.name}-divider`}/>}
			{showBookmarkbar && <BookmarkBar />}
		</div>
	);
}

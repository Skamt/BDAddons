import React from "@React";
import TabBar from "../TabBar";
import BookmarkBar from "../BookmarkBar";

export default function App({ leading, trailing }) {
	return (
		<div className="channel-tabs-container">
			<TabBar leading={leading} trailing={trailing}  />
			<div className="channel-tabs-divider"/>
			<BookmarkBar />
		</div>
	);
}

import "./styles";
import React from "@React";
import TabBar from "../TabBar";
import BookmarkBar from "../BookmarkBar";

export default function App({ leading, trailing }) {
	return (
		<div className={`${config.info.name}-container Tabbys-vars`}>
			<TabBar leading={leading} trailing={trailing}  />
			{/*<div className={`${config.info.name}-divider`}/>*/}
			{/*<BookmarkBar />*/}
		</div>
	);
}

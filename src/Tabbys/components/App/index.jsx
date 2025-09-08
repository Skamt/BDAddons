import "./styles";
import React from "@React";
import { clsx } from "@Utils";
import TabBar from "@/components/TabBar";
import BookmarkBar from "@/components/BookmarkBar";
import SettingsButton from "@/components/SettingsButton";
const c = clsx("tabbys-app");

export default function App({ leading, trailing }) {
	// console.log(leading)
	return (
		<div className={c("container")}>
			{/*<div className={c("leading")}>{leading}</div>*/}
			<div className={c("tabbar")}><TabBar /></div>
			{/*<div className={c("setting")}>
				<SettingsButton />
			</div>*/}
			<div className={c("trailing")}>
				{React.cloneElement(trailing, {
					children: [<SettingsButton />, ...trailing.props.children]
				})}
			</div>
			<div className={c("bookmarkbar")}>
				<BookmarkBar />
			</div>
		</div>
	);
}

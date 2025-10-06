import "./styles";
import React from "@React";
import { shallow } from "@Utils";
import { classNameFactory, join } from "@Utils/css";
import Settings from "@Utils/Settings";
import TabBar from "@/components/TabBar";
import BookmarkBar from "@/components/BookmarkBar";
import SettingsButton from "@/components/SettingsButton";

const c = classNameFactory("tabbys-app");

export default function App({ leading, trailing }) {
	const [size, privacyMode, keepTitle, showTabbar, showBookmarkbar, showSettingsButton] = Settings(_ => [_.size, _.privacyMode, _.keepTitle, _.showTabbar, _.showBookmarkbar, _.showSettingsButton], shallow);

	return (
		<div
			style={{
				"--size": `${size}px`
			}}
			className={c("container", { showTabbar, showBookmarkbar, keepTitle, privacyMode })}>
			{keepTitle && <div className={c("leading")}>{leading}</div>}
			{showTabbar && (
				<div className={c("tabbar")}>
					<TabBar />
				</div>
			)}

			<div className={c("trailing")}>
				{React.cloneElement(trailing, {
					children: [showSettingsButton && <SettingsButton />, ...trailing.props.children]
				})}
			</div>
			{showBookmarkbar && (
				<div className={join(c("bookmarkbar"))}>
					<BookmarkBar />
				</div>
			)}
		</div>
	);
}

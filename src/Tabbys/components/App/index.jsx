import "./styles";
import React from "@React";
import { shallow, clsx } from "@Utils";
import { join } from "@Utils/String";
import Settings from "@Utils/Settings";
import TabBar from "@/components/TabBar";
import BookmarkBar from "@/components/BookmarkBar";
import SettingsButton from "@/components/SettingsButton";
const c = clsx("tabbys-app");

export default function App({ leading, trailing }) {
	const [privacyMode, showTabbar, showBookmarkbar, showSettingsButton] = Settings(_ => [_.privacyMode, _.showTabbar, _.showBookmarkbar, _.showSettingsButton], shallow);

	return (
		<div className={c("container", !showTabbar && "noTabbar", !showBookmarkbar && "noBookmark", privacyMode && "privacy-mode")}>
			{!showTabbar && !showBookmarkbar && <div className={c("leading")}>{leading}</div>}
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
				<div className={join(" ", c("bookmarkbar"), "no-drag")}>
					{" "}
					<BookmarkBar />
				</div>
			)}
		</div>
	);
}

import { DiscordPopout } from "@Discord/Modules";
import { Store } from "@/Store";
import Bookmark from "./index";
import React, { useRef } from "@React";
import { concateClassNames } from "@Utils";
import { DropTarget } from "@Discord/Modules";
import { buildTab } from "@/utils";

function DragThis(comp) {
	return DropTarget(
		["TAB", "BOOKMARK"],
		{
			drop(thisComp, monitor) {
				const type = monitor.getItemType();
				const dropped = monitor.getItem();
				const { id, path } = dropped;
				console.log(thisComp);
				switch (type) {
					case "TAB": {
						// const bookmark = buildTab({ path });
						// Store.state.setBookmark(thisComp.id, {
						// 	bookmarks:
						// });
						// return;
					}
					case "BOOKMARK": {


						return;
					}
				}
				// const path = dropppedTab.path;
				// if(!path) return;
				// Store.state.addBookmark(buildTab({ path }))
			}
		},
		(connect, monitor) => {
			return {
				isOver: monitor.isOver(),
				canDrop: monitor.canDrop(),
				dropRef: connect.dropTarget()
			};
		}
	)(comp);
}

function BookmarksFolderSettingModal(props) {
	const { isOver, canDrop, dropRef } = props;
	const { name, bookmarks } = props.bookmark;

	const popoutRef = useRef();

	dropRef(popoutRef);

	return (
		<DiscordPopout
			position="bottom"
			align="center"
			animation="1"
			showShow={isOver}
			targetElementRef={popoutRef}
			renderPopout={e => {
				return bookmarks.length ? (
					// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
					<div
						onClick={e.closePopout}
						className="bookmarks-folder-popout Tabbys-vars">
						{bookmarks.map(a => [
							<Bookmark
								key={a.id}
								id={a.id}
							/>
						])}
					</div>
				) : null;
			}}
			spacing={8}>
			{e => (
				// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
				<div
					ref={popoutRef}
					className={concateClassNames("bookmark flex-center", canDrop && isOver && "candrop")}
					onClick={e.onClick}>
					<div className="bookmark-title ellipsis">{name || "Unamed Folder"}</div>
				</div>
			)}
		</DiscordPopout>
	);
}

export default DragThis(BookmarksFolderSettingModal);

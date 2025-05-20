import "./styles";
import { Store } from "@/Store";
import React, { useEffect, useState, useRef } from "@React";
import Bookmark from "../Bookmark";
import { ArrowIcon } from "@Components/Icon";
import { DiscordPopout } from "@Discord/Modules";
import { debounce, concateClassNames } from "@Utils";
import { useNumberWatcher, LengthStateEnum } from "@Utils/Hooks";
import { buildTab } from "@/utils";
import { DropTarget } from "@Discord/Modules";

function DragThis(comp) {
	return DropTarget(
		"TAB",
		{
			drop(thisComp, monitor) {
				const dropppedTab = monitor.getItem();
				const path = dropppedTab.path;
				if(!path) return;
				Store.state.addBookmark(buildTab({ path }))
			}
		},
		(connect, monitor) => {
			return {
				isOver: monitor.isOver(),
				canDrop: monitor.canDrop(),
				dropRef: connect.dropTarget(),
			};
		}
	)(comp);
}
// function getOverflowIndex(parentEl) {
// 	const children = Array.from(parentEl.children);
// 	let widthSum = 0;
// 	const overflowLimit = window.innerWidth * 0.95;
// 	for (let i = 0; i < children.length; i++) {
// 		const child = children[i];
// 		const tempSum = child.clientWidth + widthSum;
// 		if (tempSum > overflowLimit) return i;
// 		widthSum = tempSum;
// 	}
// 	return -1;
// }

function isVisible(el) {
	const elParentRect = el.parentElement.getBoundingClientRect();
	const rect = el.getBoundingClientRect();
	const elemRight = rect.right;
	const elemLeft = rect.left;

	return elemLeft >= 0 && elemRight <= elParentRect.width;
}


export default DragThis(function BookmarkBar({isOver, canDrop, dropRef}) {
	const bookmarks = Store(Store.selectors.bookmarks, (a, b) => a.length === b.length && !a.some((_, i) => a[i].id !== b[i].id));

	const bookmarksContainerRef = useRef();
	const [overflowIndex, setOverflowIndex] = useState(-1);
	const isOverflowing = overflowIndex > -1;
	const childrenLengthState = useNumberWatcher(bookmarks.length);
	const overflowBookmarks = isOverflowing ? bookmarks.slice(overflowIndex, bookmarks.length) : [];
	const bookmarkbarRef = useRef();
	dropRef(bookmarkbarRef);
	useEffect(() => {
		const bookmarksNode = bookmarksContainerRef.current;
		if (!bookmarksNode) return;

		const handleMutation = debounce(() => {
			if (childrenLengthState === LengthStateEnum.INCREASED && isOverflowing) return;
			if (childrenLengthState === LengthStateEnum.DECREASED && !isOverflowing) return;

			const childrenNodes = Array.from(bookmarksNode.children);
			const indexOfFirstNotFullyVisibleChild = childrenNodes.findIndex(a => !isVisible(a));
			setOverflowIndex(indexOfFirstNotFullyVisibleChild);
		});

		handleMutation();
		const resizeObserver = new ResizeObserver(handleMutation);
		resizeObserver.observe(bookmarksNode);

		return () => {
			resizeObserver.disconnect();
			handleMutation.clear();
		};
	}, [childrenLengthState]);

	return (
		<div className={concateClassNames("bookmarkbar", canDrop && isOver && "candrop")} ref={bookmarkbarRef}>
			<div
				ref={bookmarksContainerRef}
				className="bookmarks-container"
				onDoubleClick={e => e.stopPropagation()}>
				{bookmarks.map((a, index) => [
					<Bookmark
						key={a.id}
						id={a.id}
						divider={index !== 0}
						className={concateClassNames(isOverflowing && index >= overflowIndex && "hidden-visually")}
					/>
				])}
			</div>

			{isOverflowing && (
				<DiscordPopout
					position="bottom"
					align="right"
					animation="1"
					renderPopout={e => {
						return (
							// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
							<div
								onClick={e.closePopout}
								className="bookmarks-overflow-popout Tabbys-vars">
								{overflowBookmarks.map(a => [
									<Bookmark
										key={a.id}
										id={a.id}
									/>
								])}
							</div>
						);
					}}
					spacing={8}>
					{e => (
						// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
						<div
							className="bookmarks-overflow"
							onClick={e.onClick}>
							<ArrowIcon className="parent-dim" />
						</div>
					)}
				</DiscordPopout>
			)}
		</div>
	);
})


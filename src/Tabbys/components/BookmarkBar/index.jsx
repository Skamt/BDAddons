import "./styles";
import { Store } from "@/Store";
import React, { useEffect, useState, useRef } from "@React";
import Bookmark from "../Bookmark";
import ArrowIcon from "@Components/icons/ArrowIcon";
import { DiscordPopout } from "@Discord/Modules";
// import { DragSource, DropTarget } from "@Discord/Modules";

function getOverflowIndex(parentEl) {
	const children = Array.from(parentEl.children).filter(a => !a.className.includes("tab-div"));
	let widthSum = 0;
	const overflowLimit = window.innerWidth * .95;
	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		const tempSum = child.clientWidth + widthSum;
		if (tempSum > overflowLimit) return i;
		widthSum = tempSum;
	}
	return -1;
}

export default function BookmarkBar() {
	const bookmarks = Store(Store.selectors.bookmarks, (a, b) => a.length === b.length && !a.some((_, i) => a[i].id !== b[i].id));
	const bookmarksContainerRef = useRef();
	const [overflowIndex, setOverflowIndex] = useState(-1);
	console.log("overflowIndex", overflowIndex);
	const displayedBookmarks = overflowIndex > -1 ? bookmarks.slice(0, overflowIndex - 1) : bookmarks;
	const overflowBookmarks = overflowIndex > -1 ? bookmarks.slice(overflowIndex - 1, bookmarks.length) : [];

	useEffect(() => {
		console.log("effect");
		const bookmarksNode = bookmarksContainerRef.current;
		if (!bookmarksNode) return;
		const targetIndex = getOverflowIndex(bookmarksNode);
		console.log("targetIndex", targetIndex);
		setOverflowIndex(targetIndex);
	}, [bookmarks.length]);

	// useEffect(() => {
	// 	const bookmarksNode = bookmarksContainerRef.current;
	// 	if (!bookmarksNode) return;

	// 	function handleMutation() {
	// 		const targetIndex = getOverflowIndex(bookmarksNode);
	// 		setOverflowIndex(targetIndex);
	// 	}

	// 	window.addEventListener("resize", handleMutation);
	// 	const mutationObserver = new MutationObserver(handleMutation);
	// 	mutationObserver.observe(bookmarksNode, {
	// 		childList: true
	// 	});

	// 	return () => {
	// 		mutationObserver?.disconnect();
	// 		window.removeEventListener("resize", handleMutation);
	// 	};
	// }, []);

	return (
		<div className="bookmarkbar">
			<div
				ref={bookmarksContainerRef}
				className="bookmarks-container"
				onDoubleClick={e => e.stopPropagation()}>
				{displayedBookmarks.map((a, index) => [
					index !== 0 && <div className="tab-div" />,
					<Bookmark
						key={a.id}
						bookmarkId={a.id}
					/>
				])}
			</div>

			{overflowIndex > -1 && (
				<DiscordPopout
					position="bottom"
					align="right"
					animation="1"
					renderPopout={e => {
						return (
							// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
							<div
								onClick={e.closePopout}
								className="bookmarks-overflow-popout">
								{overflowBookmarks.map(a => [
									<Bookmark
										key={a.id}
										bookmarkId={a.id}
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
							<ArrowIcon />
						</div>
					)}
				</DiscordPopout>
			)}
		</div>
	);
}

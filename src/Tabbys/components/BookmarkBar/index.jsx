// import "./styles";
import Store from "@/Store";
import Bookmark from "@/components/Bookmark";
import Folder, { SimpleFolder } from "@/components/Folder";
import { ArrowIcon } from "@Components/Icon";
import Popout from "@Components/Popout";
import React, { useRef, useEffect, useState } from "@React";
import { clsx, shallow } from "@Utils";
import { join } from "@Utils/String";
const c = clsx("bookmarkbar");

export default function BookmarkBar() {
	const bookmarks = Store(Store.selectors.bookmarks, shallow);
	const contentRef = useRef();
	const [overflowedItems, setOverflowedItems] = useState([]);

	useEffect(() => {
		const node = contentRef.current;
		if (!node) return;

		const handleIntersection = entries => {
			setOverflowedItems(p => {
				const res = new Set(p);

				for (let i = entries.length - 1; i >= 0; i--) {
					const id = entries[i].target.dataset.id;
					if (!id) continue;
					if (entries[i].isIntersecting) res.delete(id);
					else res.add(id);
				}
				return [...res];
			});
		};

		const intersectionObserver = new IntersectionObserver(handleIntersection, { root: node, threshold: 1 });
		for (const child of node.children) child.dataset.id && intersectionObserver.observe(child);

		const mutationObserver = new MutationObserver(records =>
			records.forEach(record => {
				record.removedNodes.forEach(node => {
					intersectionObserver.unobserve(node);
					const id = node.dataset.id;
					if (!id) return;
					setOverflowedItems(p => {
						const res = new Set(p);
						if(res.has(id)) res.delete(id);
						return [...res];
					});
				});
				record.addedNodes.forEach(node => intersectionObserver.observe(node));
			})
		);
		mutationObserver.observe(node, { childList: true });

		return () => {
			mutationObserver?.disconnect();
			intersectionObserver?.disconnect();
		};
	}, []);

	return (
		<div className={c("container")}>
			<div
				ref={contentRef}
				className={c("content")}>
				{bookmarks.map(({ id, folderId }) => {
					const isHidden = overflowedItems.find(a => a === (folderId || id));
					return folderId ? (
						<Folder
							className={c(isHidden && "hidden")}
							id={folderId}
							key={folderId}
							bookmarkId={id}
						/>
					) : (
						<Bookmark
							className={c(isHidden && "hidden")}
							key={id}
							id={id}
						/>
					);
				})}
			</div>
			{!!overflowedItems.length && (
				<SimpleFolder items={bookmarks.filter(({ id, folderId }) => overflowedItems.find(a => a === (folderId || id)))}>
					{e => {
						return (
							<div
								className={join(" ", c("overflow-button"),"icon-wrapper")}
								onClick={e.onClick}>
								<ArrowIcon />
							</div>
						);
					}}
				</SimpleFolder>
			)}
		</div>
	);
}

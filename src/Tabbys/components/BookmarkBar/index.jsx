// import "./styles";
import Store from "@/Store";
import Bookmark from "@/components/Bookmark";
import Folder from "@/components/Folder";
import { ArrowIcon } from "@Components/Icon";
import Popout from "@Components/Popout";
import React, { useRef, useEffect, useState } from "@React";
import { shallow } from "@Utils";
import { classNameFactory, join } from "@Utils/css";
const c = classNameFactory("bookmarkbar");

function getItem(props, id, folderId) {
	return folderId ? (
		<Folder
			folderId={folderId}
			key={id}
			id={id}
			{...props}
		/>
	) : (
		<Bookmark
			key={id}
			id={id}
			{...props}
		/>
	);
}

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

		const intersectionObserver = new IntersectionObserver(handleIntersection, { root: node, threshold: 0.97 });
		for (const child of node.children) child.dataset.id && intersectionObserver.observe(child);

		const mutationObserver = new MutationObserver(records =>
			records.forEach(record => {
				record.removedNodes.forEach(node => {
					intersectionObserver.unobserve(node);
					const id = node.dataset.id;
					if (!id) return;
					setOverflowedItems(p => {
						const res = new Set(p);
						if (res.has(id)) res.delete(id);
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

	const content = bookmarks.map(({ id, folderId }, index) => {
		const hidden = overflowedItems.find(a => a === id);
		return getItem({ className: c({ hidden }) }, id, folderId);
	});

	return (
		<div className={c("container")}>
			<div
				ref={contentRef}
				className={c("content")}>
				{content}
			</div>
			{!!overflowedItems.length && <OverflowMenu items={bookmarks.filter(({ id }) => overflowedItems.find(a => a === id))} />}
		</div>
	);
}

function OverflowMenu({ items }) {
	return (
		<Popout
			position="bottom"
			align="right"
			spacing={12}
			renderPopout={e => {
				const content = items.map(({ id, folderId }) => getItem({ className:"folder-item",onClick: e.closePopout }, id, folderId));
				return <div className="overflow-popout">{content}</div>;
			}}>
			{e => {
				return (
					<div
						className={join(c("overflow-button"), "icon-wrapper")}
						onClick={e.onClick}>
						<ArrowIcon />
					</div>
				);
			}}
		</Popout>
	);
}

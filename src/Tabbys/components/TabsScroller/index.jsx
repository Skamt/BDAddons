import "./styles";
import React, { useEffect, useRef, useState } from "@React";
import { animate, getElMeta, isScrollable } from "@Utils/HTMLElement";
import { join } from "@Utils/css";
import { clsx, debounce } from "@Utils";
import { ArrowIcon } from "@Components/Icon";
const c = clsx("scroller");

function useIsScrollable() {
	const [isOverflowing, setIsOverflowing] = useState(false);
	const scrollerNodeRef = useRef();

	useEffect(() => {
		const node = scrollerNodeRef.current;
		if (!node) return;
		scrollerNodeRef.current = node;
		setIsOverflowing(isScrollable(node));
	}, []);

	useEffect(() => {
		const node = scrollerNodeRef.current;
		if (!node) return;

		const overflowListener = debounce(() => setIsOverflowing(isScrollable(node)));

		const resizeObserver = new ResizeObserver(overflowListener);
		resizeObserver.observe(node);

		const mutationObserver = new MutationObserver(overflowListener);
		mutationObserver.observe(node, { childList: true });

		return () => {
			overflowListener.clear();
			mutationObserver?.disconnect();
			resizeObserver?.disconnect();
		};
	}, []);

	return [scrollerNodeRef.current, isOverflowing, scrollerNodeRef];
}

function scroll(el, scrollValue) {
	if (!el) return;
	animate("scrollLeft", el, el.scrollLeft + scrollValue);
}

function scrollItemIntoView(scrollerNode, index) {
	if (index == null) return;

	if (!scrollerNode) return;
	const target = scrollerNode.children[index];
	if (!target) return;
	const { parentMeta, targetMeta, nextSiblingMeta, previousSiblingMeta } = getElMeta(target);

	if (!nextSiblingMeta) return scroll(scrollerNode, targetMeta.right + targetMeta.width - parentMeta.right);
	if (!previousSiblingMeta) return scroll(scrollerNode, targetMeta.left - targetMeta.width - parentMeta.left);
	if (targetMeta.left < parentMeta.left) return scroll(scrollerNode, previousSiblingMeta.right - parentMeta.left);
	if (targetMeta.right > parentMeta.right) return scroll(scrollerNode, nextSiblingMeta.left - parentMeta.right);
}

export default function TabsScroller({ items, renderItem, shouldScroll, scrollTo, containerClassName, contentClassName }) {
	const [scrollerNode, isOverflowing, ref] = useIsScrollable();

	useEffect(() => {
		// eslint-disable-next-line @eslint-react/web-api-no-leaked-timeout
		setTimeout(() => scrollItemIntoView(scrollerNode, scrollTo), 0);
	}, [scrollTo, scrollerNode, shouldScroll]);

	function scrollDelta() {
		if (!scrollerNode) return;
		return scrollerNode.clientWidth / 2;
	}

	return (
		<div className={join(c("container"), containerClassName)}>
			{isOverflowing && (
				// biome-ignore lint/a11y/useButtonType: <explanation>
				<button
					onClick={() => scroll(scrollerNode, -1 * scrollDelta())}
					className={join(c("btn", "btn-start"), "icon-wrapper", "rounded-full")}>
					<ArrowIcon />
				</button>
			)}
			<div
				ref={ref}
				className={join(c("content"), contentClassName)}>
				{items.map((item, index) => renderItem(item, index))}
			</div>
			{isOverflowing && (
				// biome-ignore lint/a11y/useButtonType: <explanation>
				<button
					onClick={() => scroll(scrollerNode, scrollDelta())}
					className={join(c("btn", "btn-end"), "icon-wrapper", "rounded-full")}>
					<ArrowIcon />
				</button>
			)}
		</div>
	);
}

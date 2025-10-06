import "./styles";
import React, { useEffect, useRef, useState } from "@React";
import { animate, getElMeta, isScrollable } from "@Utils/HTMLElement";
import { join } from "@Utils/css";
import { clsx, debounce } from "@Utils";
import { ArrowIcon } from "@Components/Icon";

function useIsScrollable() {
	const [isOverflowing, setIsOverflowing] = useState(false);
	const scrollerNode = useRef();

	useEffect(() => {
		const node = scrollerNode.current;
		if (!node) return;
		scrollerNode.current = node;
		setIsOverflowing(isScrollable(node));
	}, []);

	useEffect(() => {
		const node = scrollerNode.current;
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

	return [scrollerNode, isOverflowing];
}

const c = clsx("scroller");

export default function TabsScroller({ items, renderItem, shouldScroll, scrollTo, onScrollToEnd, containerClassName, contentClassName, endScrollButtonClassName, scrollButtonClassName, startScrollButtonClassName, getScrollSize }) {
	const [ref, isOverflowing] = useIsScrollable();

	useEffect(() => {
		setTimeout(() => {
			scrollItemIntoView(scrollTo);
		}, 0);
	}, [shouldScroll]);

	function scroll(scrollValue) {
		const scrollerNode = ref.current;
		if (!scrollerNode) return;
		animate("scrollLeft", ref.current, scrollerNode.scrollLeft + scrollValue);
	}

	function scrollDelta() {
		const scrollerNode = ref.current;
		if (!scrollerNode) return;
		return getScrollSize ? getScrollSize(scrollerNode) : scrollerNode.clientWidth / 2;
	}

	function scrollItemIntoView(index) {
		if (index == null) return;
		const scrollerNode = ref.current;
		if (!scrollerNode) return;
		const target = scrollerNode.children[index];
		if (!target) return;
		const { parentMeta, targetMeta, nextSiblingMeta, previousSiblingMeta } = getElMeta(target);

		if (!nextSiblingMeta) return scroll(targetMeta.right + targetMeta.width - parentMeta.right);
		if (!previousSiblingMeta) return scroll(targetMeta.left - targetMeta.width - parentMeta.left);
		if (targetMeta.left < parentMeta.left) return scroll(previousSiblingMeta.right - parentMeta.left);
		if (targetMeta.right > parentMeta.right) return scroll(nextSiblingMeta.left - parentMeta.right);
	}

	return (
		<div className={join(c("container"), containerClassName)}>
			{isOverflowing && (
				// biome-ignore lint/a11y/useButtonType: <explanation>
				<button
					onClick={() => scroll(-1 * scrollDelta())}
					className={join(c("btn", "btn-start"), "icon-wrapper", "rounded-full", scrollButtonClassName, startScrollButtonClassName)}>
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
					onClick={() => scroll(scrollDelta())}
					className={join(c("btn", "btn-end"), "icon-wrapper", "rounded-full", scrollButtonClassName, endScrollButtonClassName)}>
					<ArrowIcon />
				</button>
			)}
		</div>
	);
}

import "./styles";
import React, { useRef, useEffect, useState } from "@React";
import ArrowIcon from "@Components/icons/ArrowIcon";
import { concateClassNames, animate } from "@Utils";
import { Store } from "@/Store";

export default function TabsScroller({ children }) {
	console.log("TabsScroller rendered");
	const [updateScrollObserver, setUpdateScrollObserver] = useState(false);
	const [leftScrollBtn, setLeftScrollBtn] = useState(false);
	const [rightScrollBtn, setRightScrollBtn] = useState(false);
	const displayStartScrollRef = useRef(null);
	const displayEndScrollRef = useRef(null);
	const tabsRef = useRef(null);

	function getTabsMeta(tabIndex) {
		if (tabIndex == null) return {};
		const tabsNode = tabsRef.current;
		const res = {};

		if (tabsNode) {
			const rect = tabsNode.getBoundingClientRect().toJSON();
			res.tabsMeta = {
				...rect,
				clientWidth: tabsNode.clientWidth,
				scrollLeft: tabsNode.scrollLeft,
				scrollTop: tabsNode.scrollTop,
				scrollWidth: tabsNode.scrollWidth,
				top: rect.top,
				bottom: rect.bottom,
				left: rect.left,
				right: rect.right
			};
		}

		const targetTab = tabsNode.children[tabIndex];
		const nextTab = tabsNode.children[tabIndex + 1];
		const previousTab = tabsNode.children[tabIndex - 1];

		res.targetTab = !targetTab
			? {}
			: {
					...targetTab.getBoundingClientRect().toJSON(),
					isFirst: targetTab === tabsNode.children[0],
					isLast: targetTab === tabsNode.children[tabsNode.children.length - 1]
				};

		res.nextTab = !nextTab ? {} : { ...nextTab.getBoundingClientRect().toJSON() };
		res.previousTab = !previousTab ? {} : { ...previousTab.getBoundingClientRect().toJSON() };

		return res;
	}

	function scroll(scrollValue) {
		animate("scrollLeft", tabsRef.current, scrollValue);
	}

	function scrollSelectedIntoView() {
		const selectedTab = Store.state.getCurrentlySelectedTab();
		const { index } = Store.state.getTabMeta(selectedTab.id);
		if (index == null) return;
		const { tabsMeta, targetTab, nextTab, previousTab } = getTabsMeta(index);

		if (!targetTab || !tabsMeta) return;

		if (targetTab.isFirst) return scroll(tabsRef.current.scrollWidth * -1);
		if (targetTab.isLast) return scroll(tabsRef.current.scrollWidth);

		tabsMeta.right -= displayEndScrollRef.current.clientWidth;
		tabsMeta.left += displayStartScrollRef.current.clientWidth;

		if (targetTab.left < tabsMeta.left) {
			// left side of button is out of view
			const nextScrollStart = tabsMeta.scrollLeft + (previousTab.right - tabsMeta.left);
			scroll(nextScrollStart);
		} else if (targetTab.right > tabsMeta.right) {
			// right side of button is out of view
			const nextScrollStart = tabsMeta.scrollLeft + (nextTab.left - tabsMeta.right);
			scroll(nextScrollStart);
		}
	}

	useEffect(() => {
		const tabsNode = tabsRef.current;
		const tabListChildren = Array.from(tabsNode.children);
		const length = tabListChildren.length;
		if (length < 1) return;

		const firstTab = tabListChildren[0];
		const lastTab = tabListChildren[length - 1];
		const observerOptions = {
			root: tabsNode,
			threshold: 0.99
		};

		const handleLeftScrollButton = entries => setLeftScrollBtn(!entries[0].isIntersecting);
		const leftObserver = new IntersectionObserver(handleLeftScrollButton, observerOptions);
		leftObserver.observe(firstTab);

		const handleRightScrollButton = entries => setRightScrollBtn(!entries[0].isIntersecting);
		const rightObserver = new IntersectionObserver(handleRightScrollButton, observerOptions);
		rightObserver.observe(lastTab);

		return () => {
			leftObserver.disconnect();
			rightObserver.disconnect();
		};
	}, [updateScrollObserver, children.length]);

	// useEffect(() => {
	// 	const tabsNode = tabsRef.current;
	// 	if(children.length > tabsNode.children.length)
	// 		scrollSelectedIntoView();
	// }, [children.length]);

	useEffect(() => {
		return Store.subscribe(Store.selectors.selectedId, scrollSelectedIntoView);
	}, []);

	useEffect(() => {
		const tabsNode = tabsRef.current;
		if (!tabsNode) return;

		function handleMutation(records) {
			if (records.some(record => record.addedNodes.length)) scrollSelectedIntoView();
			setUpdateScrollObserver(!updateScrollObserver);
		}

		const mutationObserver = new MutationObserver(handleMutation);
		mutationObserver.observe(tabsNode, {
			childList: true
		});
		return () => {
			mutationObserver?.disconnect();
		};
	}, []);

	const moveTabsScroll = delta => {
		let scrollValue = tabsRef.current.scrollLeft;
		scrollValue += delta;
		scroll(scrollValue);
	};

	const getScrollSize = () => {
		const tabsNode = tabsRef.current;
		if (!tabsNode) return;
		const containerSize = tabsNode.clientWidth;
		let totalSize = 0;
		const children = Array.from(tabsNode.children);

		for (let i = 0; i < children.length; i += 1) {
			const tab = children[i];
			if (totalSize + tab.clientWidth > containerSize) {
				if (i === 0) {
					totalSize = containerSize;
				}
				break;
			}
			totalSize += tab.clientWidth;
		}

		return totalSize;
	};

	const handleStartScrollClick = () => {
		moveTabsScroll(-1 * getScrollSize());
	};

	const handleEndScrollClick = () => {
		moveTabsScroll(getScrollSize());
	};

	return (
		<div className="tabs-scroller">
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<div
				ref={displayStartScrollRef}
				onClick={handleStartScrollClick}
				className={concateClassNames("left-arrow", !leftScrollBtn && "hidden")}>
				<ArrowIcon />
			</div>

			<div
				className="tabs-list"
				ref={tabsRef}>
				{children}
			</div>

			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<div
				ref={displayEndScrollRef}
				onClick={handleEndScrollClick}
				className={concateClassNames("right-arrow", !rightScrollBtn && "hidden")}>
				<ArrowIcon />
			</div>
		</div>
	);
}

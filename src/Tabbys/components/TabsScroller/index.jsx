import "./styles";
import React, { useRef, useEffect, useState } from "@React";
import ArrowIcon from "@Components/icons/ArrowIcon";
import { animate } from "@Utils";
import { Store } from "@/Store";

export default function TabsScroller({ selectedTab, children }) {
	console.log("TabsScroller rendered");
	const [updateScrollObserver, setUpdateScrollObserver] = useState(false);
	const [leftScrollBtn, setLeftScrollBtn] = useState(false);
	const [rightScrollBtn, setRightScrollBtn] = useState(false);
	const { index: selectedTabIndex } = (selectedTab.id && Store.state.getTabMeta(selectedTab.id)) || {};

	const tabsRef = useRef(null);
	// const displayStartScrollRef = useRef(null);
	// const displayEndScrollRef = useRef(null);
	const getTabsMeta = () => {
		if (!selectedTabIndex) return {};
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

		const targetTab = tabsNode.children[selectedTabIndex];
		const nextTab = tabsNode.children[selectedTabIndex + 1];
		const previousTab = tabsNode.children[selectedTabIndex - 1];

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
	};

	const scroll = scrollValue => {
		animate("scrollLeft", tabsRef.current, scrollValue);
		// tabsRef.current.scrollLeft = scrollValue;
	};

	const scrollSelectedIntoView = () => {
		const { tabsMeta, targetTab, nextTab, previousTab } = getTabsMeta();

		if (!targetTab || !tabsMeta) return;

		if (targetTab.isFirst) return scroll(tabsRef.current.scrollWidth * -1);
		if (targetTab.isLast) return scroll(tabsRef.current.scrollWidth);

		if (targetTab.left < tabsMeta.left) {
			// left side of button is out of view
			const nextScrollStart = tabsMeta.scrollLeft + (previousTab.right - tabsMeta.left);
			scroll(nextScrollStart);
		} else if (targetTab.right > tabsMeta.right) {
			// right side of button is out of view
			const nextScrollStart = tabsMeta.scrollLeft + (nextTab.left - tabsMeta.right);
			scroll(nextScrollStart);
		}
	};

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
	}, [updateScrollObserver,children.length]);

	useEffect(() => {
		scrollSelectedIntoView();
	}, [selectedTab.id]);

	useEffect(() => {
		const tabsNode = tabsRef.current;
		if (!tabsNode) return;

		function handleMutation() {
			// handleResize();
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
		const containerSize = tabsRef.current.clientWidth;
		let totalSize = 0;
		const children = Array.from(tabsRef.current.children);

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
			{leftScrollBtn && (
				// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
				<div
					// ref={displayStartScrollRef}
					onClick={handleStartScrollClick}
					className="left-arrow">
					<ArrowIcon />
				</div>
			)}
			<div
				className="tabs-list"
				ref={tabsRef}>
				{children}
			</div>
			{rightScrollBtn && (
				// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
				<div
					// ref={displayEndScrollRef}
					onClick={handleEndScrollClick}
					className="right-arrow">
					<ArrowIcon />
				</div>
			)}
		</div>
	);
}

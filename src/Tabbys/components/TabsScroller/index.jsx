import "./styles";
import React, { useReducer, useRef, useEffect, useState } from "@React";
import ArrowIcon from "@Components/icons/ArrowIcon";
import { debounce, concateClassNames, animate } from "@Utils";
import { Store } from "@/Store";

function useChildrenLengthStateChange(children) {
	const lastCount = useRef(React.Children.count(children));
	const currentCount = React.Children.count(children);

	let state = "";
	if (lastCount.current < currentCount) state = "INCREASED";
	else if (lastCount.current > currentCount) state = "DECREASED";
	lastCount.current = currentCount;
	return state;
}

function useForceUpdate() {
    return useReducer((num) => num + 1, 0);
}

export default function TabsScroller({ children }) {
	console.log("TabsScroller rendered");
	const [updateScrollObserver, setUpdateScrollObserver] = useForceUpdate();

	const [leftScrollBtn, setLeftScrollBtn] = useState(false);
	const [rightScrollBtn, setRightScrollBtn] = useState(false);
	const displayStartScrollRef = useRef(null);
	const displayEndScrollRef = useRef(null);
	const tabsRef = useRef(null);
	const childrenLengthState = useChildrenLengthStateChange(children);

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

		const tabsNodes = tabsNode.querySelectorAll(".tab");
		const targetTab = tabsNodes[tabIndex];
		const nextTab = tabsNodes[tabIndex + 1];
		const previousTab = tabsNodes[tabIndex - 1];

		res.targetTab = !targetTab
			? {}
			: {
					...targetTab.getBoundingClientRect().toJSON(),
					isFirst: targetTab === tabsNodes[0],
					isLast: targetTab === tabsNodes[tabsNodes.length - 1]
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
		if (!selectedTab) return;
		const index = Store.state.getTabIndex(selectedTab.id);
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
		// Scroll to newly added tab
		if (childrenLengthState !== "INCREASED") return;
		scrollSelectedIntoView();
	}, [children.length]);

	useEffect(() => {
		// Scroll selected into view
		return Store.subscribe(Store.selectors.selectedId, scrollSelectedIntoView);
	}, []);

	useEffect(() => {
		console.log("IntersectionObserver");
		const tabsNode = tabsRef.current;
		const tabListChildren = Array.from(tabsNode.children);
		const length = tabListChildren.length;
		if (length < 1) return;

		const firstTab = tabListChildren[0];
		const lastTab = tabListChildren[length - 1];
		console.log(firstTab, lastTab);
		const observerOptions = {
			root: tabsNode,
			threshold: 0.99
		};

		const handleLeftScrollButton = entries => setLeftScrollBtn(!entries.sort((a,b)=> a.time - b.time).pop().isIntersecting);
		const leftObserver = new IntersectionObserver(debounce(handleLeftScrollButton), observerOptions);
		leftObserver.observe(firstTab);

		const handleRightScrollButton = entries => setRightScrollBtn(!entries.sort((a,b)=> a.time - b.time).pop().isIntersecting);
		const rightObserver = new IntersectionObserver(debounce(handleRightScrollButton), observerOptions);
		rightObserver.observe(lastTab);

		return () => {
			leftObserver.disconnect();
			rightObserver.disconnect();
		};
	}, [updateScrollObserver]);

	useEffect(() => {
		const tabsNode = tabsRef.current;
		if (!tabsNode) return;

		function handleMutation() {
			console.log("mutation");
			setUpdateScrollObserver();
		}

		window.addEventListener("resize", handleMutation);
		const mutationObserver = new MutationObserver(handleMutation);
		mutationObserver.observe(tabsNode, {
			childList: true
		});

		return () => {
			mutationObserver?.disconnect();
			window.removeEventListener("resize", handleMutation);
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

	const handleStartScrollClick = () => moveTabsScroll(-1 * getScrollSize());
	const handleEndScrollClick = () => moveTabsScroll(getScrollSize());

	return (
		<div className="tabs-scroller">
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<div
				ref={displayStartScrollRef}
				onClick={handleStartScrollClick}
				className={concateClassNames("scrollBtn left-arrow", !leftScrollBtn && "hidden")}>
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
				className={concateClassNames("scrollBtn right-arrow", !rightScrollBtn && "hidden")}>
				<ArrowIcon />
			</div>
		</div>
	);
}

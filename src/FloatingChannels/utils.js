import { useRef, useEffect } from "@React";
import { getUserName } from "@Utils";

import { findInTree, getInternalInstance } from "@Api";
import { Filters, getModule } from "@Webpack";

const activityPanelClasses = getModule(Filters.byKeys("activityPanel", "panels"), { searchExports: false });

export const getFluxContainer = (() => {
	let userAreaFluxContainer = undefined;

	function tryGetFluxContainer() {
		const el = document.querySelector(`.${activityPanelClasses.panels}`);
		if (!el) return;
		const instance = getInternalInstance(el);
		if (!instance) return;
		const res = findInTree(instance, a => a?.type?.prototype?.hasParty, { walkable: ["child", "sibling"] });
		if (!res) return;
		return res;
	}

	return () => {
		if (userAreaFluxContainer) return Promise.resolve(userAreaFluxContainer);
		userAreaFluxContainer = tryGetFluxContainer();
		if (userAreaFluxContainer) Promise.resolve(userAreaFluxContainer);

		return new Promise(resolve => {
			const interval = setInterval(() => {
				userAreaFluxContainer = tryGetFluxContainer();
				if (!userAreaFluxContainer) return;
				resolve(userAreaFluxContainer);
				clearInterval(interval);
			}, 500);

			/* Fail safe */
			setTimeout(() => {
				resolve(null);
				clearInterval(interval);
			}, 60 * 1000);
		});
	};
})();

export function getChannelName(channel) {
	if (!channel) return;
	if (channel.isDM() || channel.isGroupDM()) return channel.rawRecipients.map(getUserName).join(", ");
	return channel.name;
}

export function buildWindow(channelId) {
	return {
		channelId,
		id: crypto.randomUUID()
	};
}

export const useDraggable = () => {
	const targetRef = useRef();
	const handleRef = useRef();
	const position = useRef();

	useEffect(() => {
		const targetEl = targetRef.current;
		const handle = handleRef.current;

		const dragTarget = handle || targetEl;
		if (!dragTarget) return;

		dragTarget.addEventListener("mousedown", handleMouseDown);

		function handleMouseDown(e) {
			const rect = targetEl.getBoundingClientRect();

			const startPos = {
				x: e.clientX - rect.x,
				y: e.clientY - rect.y
			};

			const handleMouseMove = e => {
				const dx = Math.round(e.clientX - startPos.x);
				const dy = Math.round(e.clientY - startPos.y);
				position.current = { dx, dy };
				targetEl.style.translate = `${dx}px ${dy}px`;
			};

			const handleMouseUp = () => {
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
			};

			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
		}

		return () => dragTarget.removeEventListener("mousedown", handleMouseDown);
	}, []);

	return [targetRef, handleRef];
};


/* https://github.com/MikkelWestermann/react-use-resizable */
const MoveEvent = {
	MouseMove: "mousemove",
	TouchMove: "touchmove"
};

const EndEvent = {
	MouseUp: "mouseup",
	TouchEnd: "touchend"
};

const defaultProps = {
	interval: 1,
	initialHeight: 100,
	initialWidth: 100,
	lockHorizontal: false,
	lockVertical: false
};

export const useResizable = options => {
	const props = Object.assign(Object.assign({}, defaultProps), options);
	const parentRef = useRef(null);
	const getRootProps = () => {
		const { initialHeight, initialWidth } = props;
		return {
			ref: parentRef,
			style: {
				height: initialHeight,
				width: initialWidth
			}
		};
	};
	const getHandleProps = handleProps => {
		if (!handleProps) {
			handleProps = {};
		}
		const { parent = parentRef, interval = 1, maxHeight = Number.MAX_SAFE_INTEGER, maxWidth = Number.MAX_SAFE_INTEGER, reverse, lockHorizontal, lockVertical, onResize, onDragEnd, onDragStart, minHeight = 0, minWidth = 0, disabled = false, maintainAspectRatio = false } = Object.assign(Object.assign({}, props), handleProps);
		const handleMove = (clientY, startHeight, startY, clientX, startWidth, startX) => {
			let _a;
			let _b;
			if (disabled) return;
			const currentWidth = ((_a = parent === null || parent === void 0 ? void 0 : parent.current) === null || _a === void 0 ? void 0 : _a.clientWidth) || 0;
			const currentHeight = ((_b = parent === null || parent === void 0 ? void 0 : parent.current) === null || _b === void 0 ? void 0 : _b.clientHeight) || 0;
			let roundedHeight = currentHeight;
			let roundedWidth = currentWidth;
			if (!lockVertical) {
				const newHeight = startHeight + (clientY - startY) * (reverse ? -1 : 1);
				// Round height to nearest interval
				roundedHeight = Math.round(newHeight / interval) * interval;
				if (roundedHeight <= 0) {
					roundedHeight = interval;
				}
				if (roundedHeight >= maxHeight) {
					roundedHeight = maxHeight;
				}
				if (roundedHeight <= minHeight) {
					roundedHeight = minHeight;
				}
				if (parent === null || parent === void 0 ? void 0 : parent.current) {
					parent.current.style.height = `${roundedHeight}px`;
				}
			}
			if (!lockHorizontal) {
				const newWidth = startWidth + (clientX - startX) * (reverse ? -1 : 1);
				// Round height to nearest interval
				roundedWidth = Math.round(newWidth / interval) * interval;
				if (roundedWidth <= 0) {
					roundedWidth = interval;
				}
				if (roundedWidth >= maxWidth) {
					roundedWidth = maxWidth;
				}
				if (roundedWidth <= minWidth) {
					roundedWidth = minWidth;
				}
				if (parent === null || parent === void 0 ? void 0 : parent.current) {
					parent.current.style.width = `${roundedWidth}px`;
				}
			}
			if (maintainAspectRatio) {
				const aspectRatio = currentWidth / currentHeight;
				const newAspectRatio = roundedWidth / roundedHeight;
				if (newAspectRatio > aspectRatio) {
					roundedWidth = roundedHeight * aspectRatio;
					if (parent === null || parent === void 0 ? void 0 : parent.current) {
						parent.current.style.width = `${roundedWidth}px`;
					}
				} else {
					roundedHeight = roundedWidth / aspectRatio;
					if (parent === null || parent === void 0 ? void 0 : parent.current) {
						parent.current.style.height = `${roundedHeight}px`;
					}
				}
			}
			if (onResize) {
				onResize({
					newHeight: roundedHeight,
					heightDiff: roundedHeight - currentHeight,
					newWidth: roundedWidth,
					widthDiff: roundedWidth - currentWidth
				});
			}
		};
		const handleMouseMove = (startHeight, startY, startWidth, startX) => e => {
			if (!(e instanceof MouseEvent)) return;
			handleMove(e.clientY, startHeight, startY, e.clientX, startWidth, startX);
		};
		const handleTouchMove = (startHeight, startY, startWidth, startX) => e => {
			e.preventDefault();
			if (!(e instanceof TouchEvent)) return;
			handleMove(e.touches[0].clientY, startHeight, startY, e.touches[0].clientX, startWidth, startX);
		};
		const handleDragEnd = (handleMoveInstance, moveEvent, endEvent, startHeight, startWidth) => {
			function dragHandler() {
				let _a;
				let _b;
				document.removeEventListener(moveEvent, handleMoveInstance);
				document.removeEventListener(endEvent, dragHandler);
				if (onDragEnd) {
					const currentWidth = ((_a = parent === null || parent === void 0 ? void 0 : parent.current) === null || _a === void 0 ? void 0 : _a.clientWidth) || 0;
					const currentHeight = ((_b = parent === null || parent === void 0 ? void 0 : parent.current) === null || _b === void 0 ? void 0 : _b.clientHeight) || 0;
					onDragEnd({
						newHeight: currentHeight,
						heightDiff: currentHeight - startHeight,
						newWidth: currentWidth,
						widthDiff: currentWidth - startWidth
					});
				}
			}
			return dragHandler;
		};
		const handleDown = e => {
			let _a;
				let _b;
			if (disabled) return;
			const startHeight = ((_a = parent === null || parent === void 0 ? void 0 : parent.current) === null || _a === void 0 ? void 0 : _a.clientHeight) || 0;
			const startWidth = ((_b = parent === null || parent === void 0 ? void 0 : parent.current) === null || _b === void 0 ? void 0 : _b.clientWidth) || 0;
			let moveHandler = null;
			let moveEvent = null;
			let endEvent = null;
			if (e.type === "mousedown") {
				const { clientY, clientX } = e;
				moveHandler = handleMouseMove(startHeight, clientY, startWidth, clientX);
				moveEvent = MoveEvent.MouseMove;
				endEvent = EndEvent.MouseUp;
			} else if (e.type === "touchstart") {
				const { touches } = e;
				const { clientY, clientX } = touches[0];
				moveHandler = handleTouchMove(startHeight, clientY, startWidth, clientX);
				moveEvent = MoveEvent.TouchMove;
				endEvent = EndEvent.TouchEnd;
			}
			if (!moveHandler || !moveEvent || !endEvent) return;
			if (onDragStart) {
				onDragStart({
					newHeight: startHeight,
					heightDiff: 0,
					newWidth: startWidth,
					widthDiff: 0
				});
			}
			const dragEndHandler = handleDragEnd(moveHandler, moveEvent, endEvent, startHeight, startWidth);
			// Attach the mousemove/mouseup/touchmove/touchend listeners to the document
			// so that we can handle the case where the user drags outside of the element
			document.addEventListener(moveEvent, moveHandler, { passive: false });
			document.addEventListener(endEvent, dragEndHandler);
		};
		
		return {
			onMouseDown: handleDown,
			onTouchStart: handleDown,
		};
	};
	return {
		rootRef: parentRef,
		getRootProps,
		getHandleProps
	};
};

/**
 * @name FloatingChannels
 * @description Empty description
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/FloatingChannels
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/FloatingChannels/FloatingChannels.plugin.js
 */

const config = {
	"info": {
		"name": "FloatingChannels",
		"version": "1.0.0",
		"description": "Empty description",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/FloatingChannels/FloatingChannels.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/FloatingChannels",
		"authors": [{
			"name": "Skamt"
		}]
	}
}

// common\Api.js
const Api = new BdApi(config.info.name);
const DOM = Api.DOM;
const React = Api.React;
const Patcher = Api.Patcher;
const ContextMenu = Api.ContextMenu;
const Logger = Api.Logger;
const Webpack = Api.Webpack;
const findInTree = Api.Utils.findInTree;
const getInternalInstance = Api.ReactUtils.getInternalInstance.bind(Api.ReactUtils);

// common\Utils\Logger.js
Logger.patchError = patchId => {
	console.error(`%c[${config.info.name}] %cCould not find module for %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
};

// common\Webpack.js
const getModule = Webpack.getModule;
const Filters = Webpack.Filters;
const getMangled = Webpack.getMangled;
const getStore = Webpack.getStore;

// common\DiscordModules\zustand.js
const { zustand } = getMangled(Filters.bySource("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe"), {
	_: Filters.byStrings("subscribe"),
	zustand: () => true
});
const subscribeWithSelector = getModule(Filters.byStrings("equalityFn", "fireImmediately"), { searchExports: true });
const zustand$1 = zustand;

// common\DiscordModules\Modules.js
const Dispatcher = getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: false });

// src\FloatingChannels\Store.js
const Store = Object.assign(
	zustand$1(
		subscribeWithSelector((set, get) => {
			return {
				focused: null,
				windows: [],
				clear() {
					set({ windows: [], focused: null });
				},
				setFocused(id) {
					set({ focused: id });
				},
				getFocused() {
					return get().focused;
				},
				add(w) {
					const state = get();
					set({ windows: [...state.windows, w], focused: w.id });
				},
				remove(id) {
					const state = get();
					const index = state.windows.findIndex(a => a.id === id);
					set({ windows: state.windows.toSpliced(index, 1) });
				},
				get(id) {
					const state = get();
					return state.windows.find(a => a.id === id);
				}
			};
		})
	), {
		init() {
			Dispatcher.subscribe("LOGOUT", Store.state.clear);
		},
		dispose() {
			Store.state.clear();
			Dispatcher.unsubscribe("LOGOUT", Store.state.clear);
		},
		selectors: {
			windows: state => state.windows
		}
	}
);
Object.defineProperty(Store, "state", {
	configurable: false,
	get: () => Store.getState()
});

// common\React.js
const useEffect = React.useEffect;
const useRef = React.useRef;

// common\Utils.jsx
function isValidString(string) {
	return string && string.length > 0;
}

function getUserName(userObject = {}) {
	const { global_name, globalName, username } = userObject;
	if (isValidString(global_name)) return global_name;
	if (isValidString(globalName)) return globalName;
	if (isValidString(username)) return username;
	return "???";
}

function concateClassNames(...args) {
	return args.filter(Boolean).join(" ");
}

// src\FloatingChannels\utils.js
getModule(Filters.byKeys("activityPanel", "panels"), { searchExports: false });

function getChannelName(channel) {
	if (!channel) return;
	if (channel.isDM() || channel.isGroupDM()) return channel.rawRecipients.map(getUserName).join(", ");
	return channel.name;
}

function buildWindow(channelId) {
	return {
		channelId,
		id: crypto.randomUUID()
	};
}
const useDraggable = () => {
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
const useResizable = options => {
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
		const { parent = parentRef, interval = 1, maxHeight = Number.MAX_SAFE_INTEGER, maxWidth = Number.MAX_SAFE_INTEGER, reverse, reverseWidth, reverseHeight, lockHorizontal, lockVertical, onResize, onDragEnd, onDragStart, minHeight = 0, minWidth = 0, disabled = false, maintainAspectRatio = false } = Object.assign(Object.assign({}, props), handleProps);
		const handleMove = (clientY, startHeight, startY, clientX, startWidth, startX) => {
			let _a;
			let _b;
			if (disabled) return;
			const currentWidth = ((_a = parent === null || parent === void 0 ? void 0 : parent.current) === null || _a === void 0 ? void 0 : _a.clientWidth) || 0;
			const currentHeight = ((_b = parent === null || parent === void 0 ? void 0 : parent.current) === null || _b === void 0 ? void 0 : _b.clientHeight) || 0;
			let roundedHeight = currentHeight;
			let roundedWidth = currentWidth;
			if (!lockVertical) {
				const newHeight = startHeight + (clientY - startY) * (reverse || reverseHeight ? -1 : 1);
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
				const newWidth = startWidth + (clientX - startX) * (reverse || reverseWidth ? -1 : 1);
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

// src\FloatingChannels\patches\patchContextMenu.jsx
const ChannelActions = getModule(Filters.byKeys("actions", "fetchMessages"));
const patchContextMenu = () => {
	return [
		...["thread-context", "user-context", "channel-context"].map(context =>
			ContextMenu.patch(context, (retVal, { channel }) => {
				if (!channel) return;
				retVal.props.children.splice(0, 0, [
					ContextMenu.buildItem({
						id: `${config.info.name}-open-window`,
						action: () => {
							ChannelActions.fetchMessages({ channelId: channel.id });
							Store.state.add(buildWindow(channel.id));
						},
						label: "Open in window"
					}),
					ContextMenu.buildItem({ type: "separator" })
				]);
			})
		)
	];
};

// common\Components\ErrorBoundary\index.jsx
class ErrorBoundary extends React.Component {
	state = { hasError: false, error: null, info: null };
	componentDidCatch(error, info) {
		this.setState({ error, info, hasError: true });
		const errorMessage = `\n\t${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
		console.error(`%c[${config?.info?.name || "Unknown Plugin"}] %cthrew an exception at %c[${this.props.id}]\n`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
	}
	renderErrorBoundary() {
		return (
			React.createElement('div', { style: { background: "#292c2c", padding: "20px", borderRadius: "10px" }, }, React.createElement('b', { style: { color: "#e0e1e5" }, }, "An error has occured while rendering ", React.createElement('span', { style: { color: "orange" }, }, this.props.id)))
		);
	}
	renderFallback() {
		if (React.isValidElement(this.props.fallback)) {
			if (this.props.passMetaProps)
				this.props.fallback.props = {
					id: this.props.id,
					plugin: config?.info?.name || "Unknown Plugin",
					...this.props.fallback.props
				};
			return this.props.fallback;
		}
		return (
			React.createElement(this.props.fallback, {
				id: this.props.id,
				plugin: config?.info?.name || "Unknown Plugin",
			})
		);
	}
	render() {
		if (!this.state.hasError) return this.props.children;
		return this.props.fallback ? this.renderFallback() : this.renderErrorBoundary();
	}
}

// @Modules\useStateFromStores
const useStateFromStores = getModule(Filters.byStrings("getStateFromStores"), { searchExports: true });

// @Stores\ChannelStore
const ChannelStore = getStore("ChannelStore");

// common\Components\Icon\index.jsx
/* eslint-disable react/jsx-key */
function svg(svgProps, ...paths) {
	return comProps => (
		React.createElement('svg', {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 24 24",
			...svgProps,
			...comProps,
		}, paths.map(p => (typeof p === "string" ? path(null, p) : p)))
	);
}

function path(props, d) {
	return (
		React.createElement('path', {
			...props,
			d: d,
		})
	);
}
const CloseIcon = svg(null, "M17.3 18.7a1 1 0 0 0 1.4-1.4L13.42 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3Z");

// src\FloatingChannels\components\FloatingWindow.jsx
function FloatingWindow({ focused, onMouseDown, title, content, onClose }) {
	const [fw, handle] = useDraggable();
	const { getRootProps, getHandleProps, rootRef } = useResizable({
		initialWidth: window.innerWidth * 0.5,
		initialHeight: window.innerHeight * 0.5
	});
	const { style } = getRootProps();
	return (
		React.createElement('div', {
			style: style,
			ref: e => {
				rootRef.current = e;
				fw.current = e;
			},
			onMouseDown: onMouseDown,
			className: concateClassNames("floating-window-container", focused && "focused-window"),
		}, React.createElement('div', {
			ref: handle,
			className: "floating-window-title-bar",
		}, React.createElement('div', { className: "floating-window-title", }, title), React.createElement('div', {
			className: "floating-window-close",
			onClick: onClose,
		}, React.createElement(CloseIcon, null))), React.createElement('div', { className: "floating-window-content", }, content), React.createElement('div', {
			className: "resize-handle resize-handle-top",
			...getHandleProps({
				reverse: true,
				lockHorizontal: true,
				onResize: ({ heightDiff }) => {
					if (!rootRef.current) return;
					rootRef.current.style.top = `${Number.parseInt(rootRef.current.style.top || "0") - heightDiff}px`;
				}
			}),
		}), React.createElement('div', {
			className: "resize-handle resize-handle-top-left",
			...getHandleProps({
				reverse: true,
				onResize: ({ widthDiff, heightDiff }) => {
					if (!rootRef.current) return;
					rootRef.current.style.left = `${Number.parseInt(rootRef.current.style.left || "0") - widthDiff}px`;
					rootRef.current.style.top = `${Number.parseInt(rootRef.current.style.top || "0") - heightDiff}px`;
				}
			}),
		}), React.createElement('div', {
			className: "resize-handle resize-handle-top-right",
			...getHandleProps({
				reverseHeight: true,
				onResize: ({ heightDiff }) => {
					if (!rootRef.current) return;
					rootRef.current.style.top = `${Number.parseInt(rootRef.current.style.top || "0") - heightDiff}px`;
				}
			}),
		}), React.createElement('div', {
			className: "resize-handle resize-handle-bottom-right",
			...getHandleProps({}),
		}), React.createElement('div', {
			className: "resize-handle resize-handle-bottom-left",
			...getHandleProps({
				reverseWidth: true,
				onResize: ({ widthDiff }) => {
					if (!rootRef.current) return;
					rootRef.current.style.left = `${Number.parseInt(rootRef.current.style.left || "0") - widthDiff}px`;
				}
			}),
		}), React.createElement('div', {
			className: "resize-handle resize-handle-right",
			...getHandleProps({
				lockVertical: true
			}),
		}), React.createElement('div', {
			className: "resize-handle resize-handle-bottom",
			...getHandleProps({
				lockHorizontal: true
			}),
		}), React.createElement('div', {
			className: "resize-handle resize-handle-left",
			...getHandleProps({
				reverse: true,
				lockVertical: true,
				onResize: ({ widthDiff }) => {
					if (!rootRef.current) return;
					rootRef.current.style.left = `${Number.parseInt(rootRef.current.style.left || "0") - widthDiff}px`;
				}
			}),
		}))
	);
}

// @Stores\GuildStore
const GuildStore = getStore("GuildStore");

// src\FloatingChannels\components\FloatingChannel.jsx
const ChannelComp = getModule(m => m?.type?.toString().indexOf("communicationDisabledUntil") > -1);
const chatInputTypes = BdApi.Webpack.getByKeys("OVERLAY", "NORMAL", { searchExports: true });
const FloatingChannel = React.memo(function FloatingChannel({ id }) {
	const isFocused = Store(state => state.getFocused() === id);
	const { channelId } = Store.state.get(id) || {};
	const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(channelId), [channelId]);
	if (!channel) return;
	const guild = GuildStore.getGuild(channel.id);
	const closeHandler = () => {
		Store.state.remove(id);
	};
	const clickHandler = () => {
		Store.state.setFocused(id);
	};
	return (
		React.createElement(FloatingWindow, {
			focused: isFocused,
			onMouseDown: clickHandler,
			onClose: closeHandler,
			title: getChannelName(channel),
			content: React.createElement(ChannelComp, {
				channel: channel,
				guild: guild,
				chatInputType: {
					...chatInputTypes.NORMAL,
					analyticsName: crypto.randomUUID()
				},
			}),
		})
	);
});

// src\FloatingChannels\components\FloatingWindowContainer.jsx
const FloatingWindowContainer = React.memo(() => {
	const windows = Store(Store.selectors.windows);
	return (
		React.createElement('div', { className: "floating-window-root", }, windows.map(({ id }) => (
			React.createElement(FloatingChannel, {
				key: id,
				id: id,
			})
		)))
	);
});

// src\FloatingChannels\Utils.js
const activityPanelClasses = getModule(Filters.byKeys("activityPanel", "panels"), { searchExports: false });
const getFluxContainer = (() => {
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

// src\FloatingChannels\patches\patchSomething.jsx
const patchSomething = async () => {
	const fluxContainer = await getFluxContainer();
	if (!fluxContainer) return Logger.patchError("FlowtingWindowError");
	Patcher.after(fluxContainer.type.prototype, "render", (_, __, ret) => {
		return [
			ret,
			React.createElement(ErrorBoundary, null, React.createElement(FloatingWindowContainer, null))
		];
	});
	fluxContainer.stateNode.forceUpdate();
};
async function cleanFluxContainer() {
	const fluxContainer = await getFluxContainer();
	if (fluxContainer) fluxContainer.stateNode.forceUpdate();
}

// src\FloatingChannels\index.jsx
BdApi.Webpack.getByKeys("OVERLAY", "NORMAL", { searchExports: true });
class FloatingChannels {
	start() {
		try {
			DOM.addStyle(css);
			Store.init();
			patchSomething();
			// reRender('div[data-windows="true"] > *');
			this.unpatchContextMenu = patchContextMenu();
		} catch (e) {
			Logger.error(e);
		}
	}
	stop() {
		DOM.removeStyle();
		Store.dispose();
		Patcher.unpatchAll();
		cleanFluxContainer();
		// reRender('div[data-windows="true"] > *');
		this.unpatchContextMenu?.forEach?.(p => p());
		this.unpatchContextMenu = null;
		this.unpatchChatInputType?.();
		this.unpatchChatInputType = null;
	}
}

module.exports = FloatingChannels;

const css = `
.panels_c48ade.panels_c48ade{
	z-index:111 ;
}

.floating-window-root {
	position: fixed;
	inset:0;
	z-index: 2999001;
	pointer-events:none;
	-webkit-app-region: no-drag;
}

.floating-window-container{
	position:fixed;
	pointer-events:initial;
	line-height: 1.4;
	display:grid;
	grid-template-areas:
	"resizetopleft resizeup resizetopright"
	"resizeleft title resizeright"
	"resizeleft content resizeright "
	"resizebottomleft resizedown resizebottomright"
	;
	grid-template-rows: auto auto minmax(0, 1fr) auto;
	grid-template-columns: auto minmax(0, 1fr) auto;
	
	flex-direction: column;
	--border-radius:12px;
	overflow:hidden;
	filter: drop-shadow(0px 0px 6px #000a);
}

.focused-window{
	z-index:99;
}

.floating-window-title-bar{
	display:flex;
	height:20px;
	background-color: oklab(0.262384 0.00252247 -0.00889932);
	padding:8px;
	grid-area:title;
	border-radius:var(--border-radius) var(--border-radius) 0 0;
	z-index:111 ;
}
.floating-window-title{
	display:flex;
	justify-content: center;
	align-items: center;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	color:white;
}	

.floating-window-close{
	width:20px;
	height:20px;
	box-sizing: border-box;
	display:flex;
	justify-content: center;
	align-items: center;
	margin-left:auto;
	color: var(--interactive-normal);
	cursor:pointer;
}

.floating-window-close:hover {
	color: var(--interactive-hover);
}

.floating-window-content{
	grid-area:content;
	border-radius:0 0 var(--border-radius) var(--border-radius) ;
}

.resize-handle{
	padding:3px;
	background:#0000;

}
.resize-handle-top{
	grid-area:resizeup;
	cursor:ns-resize;
}

.resize-handle-right{
	grid-area:resizeright;
	cursor:ew-resize;
}

.resize-handle-bottom{
	grid-area:resizedown;
	cursor:ns-resize;
}

.resize-handle-left{
	grid-area:resizeleft;
	cursor:ew-resize;
}

.resize-handle-bottom-left{
	grid-area:resizebottomleft;
	cursor: nesw-resize;
}

.resize-handle-bottom-right{
	grid-area:resizebottomright;
	cursor: nwse-resize;
}

.resize-handle-top-left{
	grid-area:resizetopleft;
	cursor: nwse-resize;
}

.resize-handle-top-right{
	grid-area:resizetopright;
	cursor: nesw-resize;
}`;

/**
 * @runAt idle
 * @name GuildInfo
 * @description Empty description
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/GuildInfo
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/GuildInfo/GuildInfo.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "GuildInfo",
		"version": "1.0.0",
		"description": "Empty description",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/GuildInfo/GuildInfo.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/GuildInfo",
		"authors": [{
			"name": "Skamt"
		}]
	}
};

// common/Api.js
var Api = /* @__PURE__ */ (() => new BdApi(Config_default.info.name))();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var ContextMenu = /* @__PURE__ */ (() => Api.ContextMenu)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();
var DOM = /* @__PURE__ */ (() => Api.DOM)();
var getOwnerInstance = /* @__PURE__ */ (() => BdApi.ReactUtils.getOwnerInstance.bind(BdApi.ReactUtils))();

// common/Utils/Logger.js
var Logger_default = Logger;

// common/Plugin.js
var target = /* @__PURE__ */ (() => new EventTarget())();

function wrap(handler) {
	return (e) => {
		try {
			handler.apply(null, e);
		} catch (err) {
			Logger_default.error(`Could not run [${e.type}] handler`, { handler }, "\n", err);
		}
	};
}
var Plugin_default = {
	onStart: (handler, props) => target.addEventListener("START", wrap(handler), props),
	onStop: (handler, props) => target.addEventListener("STOP", wrap(handler), props),
	start() {
		setTimeout(target.dispatchEvent(new Event("START")));
	},
	stop() {
		setTimeout(target.dispatchEvent(new Event("STOP")));
	}
};

// common/Utils/StylesLoader.js
var styleLoader = {
	_styles: [],
	push(styles) {
		this._styles.push(styles);
	}
};
Plugin_default.onStart(() => DOM.addStyle(styleLoader._styles.join("\n")));
Plugin_default.onStop(() => DOM.removeStyle());
var StylesLoader_default = styleLoader;

// src/GuildInfo/styles.css
StylesLoader_default.push(`.small {
	line-height: 20px;
	font-weight: inherit;
	font-size: 1.01em;
	white-space: nowrap;
}`);

// common/React.jsx
var useState = /* @__PURE__ */ (() => BdApi.React.useState)();
var useMemo = /* @__PURE__ */ (() => BdApi.React.useMemo)();
var React = /* @__PURE__ */ (() => BdApi.React)();
var React_default = React;
var NoopComponent = () => null;

function reRender(selector) {
	const target2 = document.querySelector(selector)?.parentElement;
	if (!target2) return;
	const instance = getOwnerInstance(target2);
	if (!instance) return;
	const unpatch = BdApi.Patcher.instead("RE_RENDER", instance, "render", () => unpatch());
	instance.forceUpdate(() => instance.forceUpdate());
}

// common/Utils/Object.js
function getObjectKey(object = {}, filter) {
	for (const key in object)
		if (filter(object[key])) return key;
}

function hasOwn(object, key) {
	return object && key && key in object;
}

// common/consts.js
var LAZY_DISCORD_COMPONENT_WRAPPER = "LazyDiscordComponentWrapper";

// common/Webpack.jsx
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var waitForModule = /* @__PURE__ */ (() => Webpack.waitForModule)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

function Suspended({ promise, fallback, ...props }) {
	const comp = React_default.use(promise);
	if (comp) return React_default.createElement(comp, props);
	return fallback;
}

function waitForComponent(filter, options, Fallback = NoopComponent) {
	const promise = waitForModule(filter, options);
	const placeHolderComponent = (props) => /* @__PURE__ */ React_default.createElement(React_default.Suspense, { fallback: /* @__PURE__ */ React_default.createElement(Fallback, null) }, /* @__PURE__ */ React_default.createElement(
		Suspended, {
			...props,
			fallback: /* @__PURE__ */ React_default.createElement(Fallback, null),
			promise
		}
	));
	placeHolderComponent.displayName = LAZY_DISCORD_COMPONENT_WRAPPER;
	return placeHolderComponent;
}

function reactRefMemoFilter(type, ...args) {
	const filter = Filters.byStrings(...args);
	return (target2) => target2[type] && filter(target2[type]);
}

function findKey(obj, filter) {
	const key = getObjectKey(obj, filter);
	return key ? [obj, key] : [];
}

function getDeclarationAndKey(moduleFilter, declarationFilter, options = {}) {
	const module2 = getModule(moduleFilter, { ...options, raw: true });
	return findKey(module2.declarations, declarationFilter);
}

// common/Utils/index.js
function fit({ width, height, gap = 0.8 }) {
	const ratio = Math.min(innerWidth / width, innerHeight / height);
	width = Math.round(width * ratio);
	height = Math.round(height * ratio);
	return {
		width,
		height,
		maxHeight: height * gap,
		maxWidth: width * gap
	};
}

function concateClassNames(...args) {
	return args.filter(Boolean).join(" ");
}

function parseSnowflake(snowflake) {
	return snowflake / 4194304 + 14200704e5;
}

// common/Utils/ImageModal/styles.css
StylesLoader_default.push(`.downloadLink {
	color: white !important;
	font-size: 14px;
	font-weight: 500;
	/*	line-height: 18px;*/
	text-decoration: none;
	transition: opacity.15s ease;
	opacity: 0.5;
}

.imageModalwrapper {
	display: flex;
	flex-direction: column;
}

.imageModalOptions {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 4px;
}
`);

// MODULES-AUTO-LOADER:@Stores/AccessibilityStore
var AccessibilityStore_default = /* @__PURE__ */ (() => getStore("AccessibilityStore"))();

// common/Utils/ImageModal/index.jsx
var RenderLinkComponent = waitForComponent((m) => m.type?.toString?.().includes("MASKED_LINK"), { searchExports: false });
var ImageModal = waitForComponent(reactRefMemoFilter("type", "renderLinkComponent"), { searchExports: true });
var ScaleProvider = waitForComponent((a) => a?._currentValue?.scale, { searchExports: true });
var useSomeScalingHook = getModule(Filters.byStrings("reducedMotion.enabled", "useSpring", "respect-motion-settings"), { searchExports: true });
var h = (e, t, n) => true === n || AccessibilityStore_default.useReducedMotion ? e.set(t) : e.start(t);
var ImageComponent = ({ url, ...rest }) => {
	const [x, P] = useState(false);
	const [M] = useSomeScalingHook(() => ({
		scale: AccessibilityStore_default.useReducedMotion ? 1 : 0.9,
		x: 0,
		y: 0,
		config: {
			friction: 30,
			tension: 300
		}
	}));
	const contextVal = useMemo(
		() => ({
			scale: M.scale,
			x: M.x,
			y: M.y,
			setScale(e, t) {
				h(M.scale, e, null == t ? void 0 : t.immediate);
			},
			setOffset(e, t, n) {
				h(M.x, e, null == n ? void 0 : n.immediate), h(M.y, t, null == n ? void 0 : n.immediate);
			},
			zoomed: x,
			setZoomed(e) {
				P(e), h(M.scale, e ? 2.5 : 1), e || (h(M.x, 0), h(M.y, 0));
			}
		}),
		[x, M]
	);
	return /* @__PURE__ */ React_default.createElement(ScaleProvider, { value: contextVal }, /* @__PURE__ */ React_default.createElement("div", { className: "imageModalwrapper" }, /* @__PURE__ */ React_default.createElement(
		ImageModal, {
			maxWidth: rest.maxWidth,
			maxHeight: rest.maxHeight,
			media: {
				...rest,
				type: "IMAGE",
				url,
				proxyUrl: url
			}
		}
	), !x && /* @__PURE__ */ React_default.createElement("div", { className: "imageModalOptions" }, /* @__PURE__ */ React_default.createElement(
		RenderLinkComponent, {
			className: "downloadLink",
			href: url
		},
		"Open in Browser"
	))));
};

// common/Utils/Modals/styles.css
StylesLoader_default.push(`.transparent-background.transparent-background{
	background: transparent;
	border:unset;
}`);

// common/Components/ErrorBoundary/index.jsx
var ErrorBoundary_default = (props) => /* @__PURE__ */ React_default.createElement(BdApi.Components.ErrorBoundary, { ...props, name: Config_default?.info?.name });

// common/Utils/Modals/index.jsx
var ModalActions = getModule((a) => a.useModalsStore);
var Modals = /* @__PURE__ */ getMangled( /* @__PURE__ */ Filters.bySource("MODAL_ROOT", "transitionState"), {
	ModalRoot: /* @__PURE__ */ Filters.byStrings("transitionState"),
	ModalFooter: /* @__PURE__ */ Filters.byStrings(".HORIZONTAL_REVERSE"),
	ModalContent: /* @__PURE__ */ Filters.byStrings("scrollbarType", "scrollerRef"),
	ModalHeader: /* @__PURE__ */ Filters.byStrings("headerIdIsManaged", "headerId", ".HORIZONTAL"),
	Animations: (a) => a.SUBTLE,
	Sizes: (a) => a.DYNAMIC,
	ModalCloseButton: Filters.byStrings("withCircleBackground")
});
var openModal = (children, tag, { className, ...modalRootProps } = {}) => {
	const id = `${tag ? `${tag}-` : ""}modal`;
	return ModalActions.openModal((props) => {
		return /* @__PURE__ */ React_default.createElement(
			ErrorBoundary_default, {
				id,
				plugin: Config_default.info.name
			},
			/* @__PURE__ */
			React_default.createElement(
				Modals.ModalRoot, {
					onClick: props.onClose,
					transitionState: props.transitionState,
					className: concateClassNames("transparent-background", className),
					size: Modals.Sizes.DYNAMIC,
					...modalRootProps
				},
				React_default.cloneElement(children, { ...props })
			)
		);
	});
};

// MODULES-AUTO-LOADER:@Stores/UserStore
var UserStore_default = /* @__PURE__ */ (() => getStore("UserStore"))();

// common/Utils/String.js
function isValidString(string) {
	return string && string.length > 0;
}

// MODULES-AUTO-LOADER:@Stores/GuildMemberStore
var GuildMemberStore_default = /* @__PURE__ */ (() => getStore("GuildMemberStore"))();

// common/DiscordModules/Modules.js
var IconsUtils = /* @__PURE__ */ (() => getModule((a) => a.getChannelIconURL))();

// common/Utils/User.js
function getUserName(userObject = {}) {
	const { global_name, globalName, username } = userObject;
	if (isValidString(global_name)) return global_name;
	if (isValidString(globalName)) return globalName;
	if (isValidString(username)) return username;
}

function getGuildMemberName(guildId, userId) {
	const memeber = GuildMemberStore_default.getMember(guildId, userId);
	if (memeber?.nick) return memeber.nick;
	const user = UserStore_default.getUser(userId);
	if (user) return getUserName(user);
	return "???";
}

// MODULES-AUTO-LOADER:@Stores/GuildStore
var GuildStore_default = /* @__PURE__ */ (() => getStore("GuildStore"))();

// common/Utils/Channel.js
function getGuildIcon(guildId, size) {
	const guild = GuildStore_default.getGuild(guildId);
	return !guild ? "" : IconsUtils.getGuildIconURL({
		id: guildId,
		icon: guild.icon,
		size
	});
}

// MODULES-AUTO-LOADER:@Stores/GuildRoleStore
var GuildRoleStore_default = /* @__PURE__ */ (() => getStore("GuildRoleStore"))();

// MODULES-AUTO-LOADER:@Stores/GuildChannelStore
var GuildChannelStore_default = /* @__PURE__ */ (() => getStore("GuildChannelStore"))();

// MODULES-AUTO-LOADER:@Stores/GuildMemberCountStore
var GuildMemberCountStore_default = /* @__PURE__ */ (() => getStore("GuildMemberCountStore"))();

// common/Patcher/shared.js
Plugin_default.onStop(() => Patcher.unpatchAll());

function patch(type, object, key, callback) {
	if (!hasOwn(object, key))
		return Logger.error("Could not perform a patch, missing arguments", arguments);
	const caller = {
		after: (context, args, ret) => callback({ context, args, ret }),
		before: (context, args) => callback({ context, args }),
		instead: (context, args, fn) => callback({ context, args, fn })
	} [type];
	return Patcher[type](object, key, caller);
}

// common/Patcher/index.js
var after = (...args) => patch("after", ...args);

// common/Patcher/contextmenu.js
var contextmenuUnPatches = [];
Plugin_default.onStop(() => {
	contextmenuUnPatches.filter(Boolean).forEach((a) => a());
	contextmenuUnPatches = [];
});
var patch2 = (id, callback) => {
	const undo = ContextMenu.patch(id, callback);
	contextmenuUnPatches.push(undo);
};
var contextmenu_default = ContextMenu;

// src/GuildInfo/index.jsx
var GuildTooltip = getDeclarationAndKey(Filters.bySource("__unsupportedReactNodeAsText", "isViewingRoles"), Filters.byStrings("isViewingRoles"));
var el = (children, props) => /* @__PURE__ */ React_default.createElement(
	"div", {
		className: "small",
		...props
	},
	children
);
Plugin_default.onStart(() => {
	after(...GuildTooltip, ({ args: [{ guild }], ret }) => {
		ret.props.children.push(...[
			el(`Owner: ${getGuildMemberName(guild.id, guild.ownerId)}`),
			el(`OwnerId: ${guild.ownerId}`),
			el(`Created At: ${new Date(parseSnowflake(+guild.id)).toLocaleDateString()}`),
			el(`Joined At: ${guild.joinedAt?.toLocaleDateString()}`),
			el(`Roles: ${GuildRoleStore_default.getSortedRoles(guild.id).length}`),
			el(`Channels: ${GuildChannelStore_default.getChannels(guild.id).count}`),
			el(`Members: ${GuildMemberCountStore_default.getMemberCount(guild.id)}`)
		]);
	});
	patch2("guild-context", (retVal, { guild }) => {
		if (!guild) return;
		const banner = getGuildIcon(guild.id, 4096);
		if (!banner) return;
		retVal.props.children.splice(
			1,
			0,
			contextmenu_default.buildItem({
				label: "View logo",
				action: () => openModal(
					/* @__PURE__ */
					React_default.createElement("div", null, /* @__PURE__ */ React_default.createElement(
						ImageComponent, {
							url: banner,
							...fit({ width: 4096, height: 4096 })
						}
					))
				)
			})
		);
	});
	reRender("#guild-list-unread-dms");
});
Plugin_default.onStop(() => reRender("#guild-list-unread-dms"));
module.exports = () => Plugin_default;

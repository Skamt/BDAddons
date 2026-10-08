import { getByKeys, getMangled, getModule, waitForModule, lazy, reactRefMemoFilter, Filters } from "@Webpack";

export let ComponentDispatch = /*@__PURE__*/ (() => {
	waitForModule(m => m.dispatchToLastSubscribed, { searchExports: true }).then(a => {
		ComponentDispatch = a;
	});
})();

export const FocusLock = /*@__PURE__*/ (() => getModule(Filters.byStrings(".containerRef,{disableReturn"), { searchExports: true }))();

export const Spinner = /*@__PURE__*/ (() => getModule(a => a?.Type?.CHASING_DOTS, { searchExports: true }))();

export const Color = /*@__PURE__*/ (() => getModule(Filters.byKeys("Color", "hex", "hsl"), { searchExports: false }))();

export const SearchableSelect = /*@__PURE__*/ (() => getMangled(`"multiple":"single",required:`, { SearchableSelect: Filters.byStrings(`"multiple":"single",required:`) }).SearchableSelect)();

export const I18n = /*@__PURE__*/ (() => getByKeys("intl", "t"))();

export const DiscordPopout = /*@__PURE__*/ (() => getModule(a => a?.prototype?.render && a.Animation, { searchExports: true }))();

export const DiscordApi = /*@__PURE__*/ (() => getMangled("HTTPUtils", { api: Filters.byKeys("get", "del", "patch", "put") }))();

export const Dispatcher = /*@__PURE__*/ (() => getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: true }))();

export const Markdown = /*@__PURE__*/ (() => getModule(Filters.byKeys("parseEmbedTitle", "defaultRules")))();

export const Anchor = /*@__PURE__*/ (() => getModule(Filters.byKeys("Anchor")).Anchor)();

export const UserProfileActions = /*@__PURE__*/ (() => getByKeys("openUserProfileModal", "closeUserProfileModal"))();

export const transitionTo = /*@__PURE__*/ (() => getModule(Filters.byStrings("transitionTo - Transitioning to"), { searchExports: true }))();

export const GroupDmAvatar = /*@__PURE__*/ (() => getModule(reactRefMemoFilter("type", "channel", "recipients", "isTyping", "status"), { searchExports: true }))();

export const DragSource = /*@__PURE__*/ (() => getModule(Filters.byStrings("drag-source", "collect"), { searchExports: true }))();

export const DropTarget = /*@__PURE__*/ (() => getModule(Filters.byStrings("drop-target", "collect"), { searchExports: true }))();

export const useDrag = /*@__PURE__*/ (() => getModule(Filters.byStrings("useDrag::"), { searchExports: true }))();

export const useDrop = /*@__PURE__*/ (() => getModule(Filters.byStrings(".options);return(0,"), { searchExports: true }))();

export const FieldWrapper = /*@__PURE__*/ (() => getModule(reactRefMemoFilter("render", "fieldWrapper", "title", "titleId"), { searchExports: true }))();

export const IconsUtils = /*@__PURE__*/ (() => getModule(a => a.getChannelIconURL))();

export const ChannelUtils = /*@__PURE__*/ (() => getModule(m => m.openPrivateChannel))();

export const RadioGroup = /*@__PURE__*/ (() => getMangled('data-toggleable-component":"radiogroup', { radioGroup: Filters.byStrings("label", "required") }).radioGroup)();

export const MediaViewerModal = /*@__PURE__*/ (() => getMangled("Media Viewer Modal", { MediaViewerModal: a => typeof a !== "string" }).MediaViewerModal)();

export const ChannelComponent = /*@__PURE__*/ () => getModule(reactRefMemoFilter("render", "hasActiveThreads"), { searchExports: true });

export const MessageHeader = /*@__PURE__*/ (() => waitForModule(Filters.byStrings("userOverride", "withMentionPrefix"), { searchExports: false }))();

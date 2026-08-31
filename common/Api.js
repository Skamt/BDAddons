import config from "@Config";
export const Api = /*@__PURE__*/ (() => new BdApi(config.info.name))();

export const Data = /*@__PURE__*/ (() => Api.Data)();
export const Patcher = /*@__PURE__*/ (() => Api.Patcher)();
export const Commands = /*@__PURE__*/ (() => Api.Commands)();
export const ContextMenu = /*@__PURE__*/ (() => Api.ContextMenu)();
export const Logger = /*@__PURE__*/ (() => Api.Logger)();
export const DOM = /*@__PURE__*/ (() => Api.DOM)();


export const UI = /*@__PURE__*/ (() => BdApi.UI)();
export const ErrorBoundary = /*@__PURE__*/ (() => BdApi.Components.ErrorBoundary)();
export const showConfirmationModal = /*@__PURE__*/ (() => BdApi.UI.showConfirmationModal)();
export const debounce = /*@__PURE__*/ (() => BdApi.Utils.debounce)();
export const findInTree = /*@__PURE__*/ (() => BdApi.Utils.findInTree)();
export const getOwnerInstance = /*@__PURE__*/ (() =>
	BdApi.ReactUtils.getOwnerInstance.bind(BdApi.ReactUtils))();
export const getInternalInstance = /*@__PURE__*/ (() =>
	BdApi.ReactUtils.getInternalInstance.bind(BdApi.ReactUtils))();

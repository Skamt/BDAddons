import config from "@Config";
export const Api = new BdApi(config.info.name);

export const UI = /*@__PURE__*/ (() => Api.UI)();
export const DOM = /*@__PURE__*/ (() => Api.DOM)();
export const Data = /*@__PURE__*/ (() => Api.Data)();
export const React = /*@__PURE__*/ (() => Api.React)();
export const ReactDOM = /*@__PURE__*/ (() => Api.ReactDOM)();
export const Patcher = /*@__PURE__*/ (() => Api.Patcher)();
export const ContextMenu = /*@__PURE__*/ (() => Api.ContextMenu)();
export const Logger = /*@__PURE__*/ (() => Api.Logger)();

// Components
export const ErrorBoundary = /*@__PURE__*/ (() => Api.Components.ErrorBoundary)();

// Webpack
export const Webpack = /*@__PURE__*/ (() => Api.Webpack)();

// Modals
export const showConfirmationModal = /*@__PURE__*/ (() => Api.UI.showConfirmationModal)();

// Utils
export const debounce = /*@__PURE__*/ (() => Api.Utils.debounce)();
export const findInTree = /*@__PURE__*/ (() => Api.Utils.findInTree)();
export const getOwnerInstance = /*@__PURE__*/ (() => Api.ReactUtils.getOwnerInstance.bind(Api.ReactUtils))();
export const getInternalInstance = /*@__PURE__*/ (() => Api.ReactUtils.getInternalInstance.bind(Api.ReactUtils))();

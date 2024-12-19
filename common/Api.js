export const Api = new BdApi(config.info.name);

export const UI = Api.UI;
export const DOM = Api.DOM;
export const Data = Api.Data;
export const React = Api.React;
export const ReactDOM = Api.ReactDOM;
export const Patcher = Api.Patcher;
export const ContextMenu = Api.ContextMenu;
export const Logger = Api.Logger;

// Components
export const ErrorBoundary = Api.Components.ErrorBoundary;

// Webpack
export const getModule = Api.Webpack.getModule;
export const Filters = Api.Webpack.Filters;
export const waitForModule = Api.Webpack.waitForModule;
export const modules = Api.Webpack.modules;

// React
export const useState = Api.React.useState;
export const useEffect = Api.React.useEffect;

// Modals
export const showConfirmationModal = Api.showConfirmationModal;

// Utils
export const debounce = Api.Utils.debounce;
export const findInTree = Api.Utils.findInTree;
export const getOwnerInstance = Api.ReactUtils.getOwnerInstance;
export const getInternalInstance = Api.ReactUtils.getInternalInstance;
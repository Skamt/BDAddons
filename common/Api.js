const Api = new BdApi(config.info.name);

export const UI = Api.UI;
export const DOM = Api.DOM;
export const Data = Api.Data;
export const React = Api.React;
export const Patcher = Api.Patcher;
export const ContextMenu = Api.ContextMenu;

// Webpack
export const getModule = Api.Webpack.getModule;
export const Filters = Api.Webpack.Filters;
export const waitForModule = Api.Webpack.waitForModule;

// ReactUtils
export const getOwnerInstance = Api.ReactUtils.getOwnerInstance;
export const getInternalInstance = Api.ReactUtils.getInternalInstance;

// React
export const useState = Api.React.useState;
export const useEffect = Api.React.useEffect;

// Utils
export const findInTree = Api.Utils.findInTree;
export const debounce = Api.Utils.debounce;
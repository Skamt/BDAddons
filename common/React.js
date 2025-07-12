import { React } from "@Api";

export const useState = /*@__PURE__*/ (() => React.useState)();
export const useEffect = /*@__PURE__*/ (() => React.useEffect)();
export const useRef = /*@__PURE__*/ (() => React.useRef)();
export const useCallback = /*@__PURE__*/ (() => React.useCallback)();
export const useMemo = /*@__PURE__*/ (() => React.useMemo)();
export const useReducer = /*@__PURE__*/ (() => React.useReducer)();
export const Children = /*@__PURE__*/ (() => React.Children)();

export default /*@__PURE__*/ (() => React)();



export const ReactDOM = /*@__PURE__*/ (() => BdApi.ReactDOM)();
export const useState = /*@__PURE__*/ (() => BdApi.React.useState)();
export const createContext = /*@__PURE__*/ (() => BdApi.React.createContext)();
export const useContext = /*@__PURE__*/ (() => BdApi.React.useContext)();
export const useEffect = /*@__PURE__*/ (() => BdApi.React.useEffect)();
export const useRef = /*@__PURE__*/ (() => BdApi.React.useRef)();
export const memo = /*@__PURE__*/ (() => BdApi.React.memo)();
export const useCallback = /*@__PURE__*/ (() => BdApi.React.useCallback)();
export const cloneElement = /*@__PURE__*/ (() => BdApi.React.cloneElement)();
export const useMemo = /*@__PURE__*/ (() => BdApi.React.useMemo)();
export const useReducer = /*@__PURE__*/ (() => BdApi.React.useReducer)();
export const Children = /*@__PURE__*/ (() => BdApi.React.Children)();
export const forwardRef = /*@__PURE__*/ (() => BdApi.React.forwardRef)();
export const useLayoutEffect = /*@__PURE__*/ (() => BdApi.React.useLayoutEffect)();
export const createPortal = /*@__PURE__*/ (() => BdApi.ReactDOM.createPortal)();
export const unstable_batchedUpdates = /*@__PURE__*/ (() => BdApi.ReactDOM.unstable_batchedUpdates)();

export default /*@__PURE__*/ (() => BdApi.React)();

export const NoopComponent = () => null;

export const LazyComponent = (get) => {
	const Comp = (props) => {
		const Component = get() ?? NoopComponent;
		return <Component {...props} />;
	};

	return Comp;
};

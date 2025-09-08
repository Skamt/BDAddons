import { ReactDOM, React } from "@Api";

export const useState = /*@__PURE__*/ (() => React.useState)();
export const createContext = /*@__PURE__*/ (() => React.createContext)();
export const useContext = /*@__PURE__*/ (() => React.useContext)();
export const useEffect = /*@__PURE__*/ (() => React.useEffect)();
export const useRef = /*@__PURE__*/ (() => React.useRef)();
export const memo = /*@__PURE__*/ (() => React.memo)();
export const useCallback = /*@__PURE__*/ (() => React.useCallback)();
export const cloneElement = /*@__PURE__*/ (() => React.cloneElement)();
export const useMemo = /*@__PURE__*/ (() => React.useMemo)();
export const useReducer = /*@__PURE__*/ (() => React.useReducer)();
export const Children = /*@__PURE__*/ (() => React.Children)();
export const forwardRef = /*@__PURE__*/ (() => React.forwardRef)();
export const useLayoutEffect = /*@__PURE__*/ (() => React.useLayoutEffect)();
export const createPortal = /*@__PURE__*/ (() => ReactDOM.createPortal)();
export const unstable_batchedUpdates = /*@__PURE__*/ (() => ReactDOM.unstable_batchedUpdates)();

export default /*@__PURE__*/ (() => React)();

export const NoopComponent = () => null;

export const LazyComponent = (get) => {
    const Comp = (props) => {
        const Component = get() ?? NoopComponent;
        return <Component {...props} />;
    };

    return Comp;
};

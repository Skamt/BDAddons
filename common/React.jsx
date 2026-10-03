import { getInternalInstance, getOwnerInstance } from "@Api";
import { add } from "@Utils/Array";

export const ReactDOM = /*@__PURE__*/ (() => BdApi.ReactDOM)();
export const useState = /*@__PURE__*/ (() => BdApi.React.useState)();
export const createContext = /*@__PURE__*/ (() => BdApi.React.createContext)();
export const useContext = /*@__PURE__*/ (() => BdApi.React.useContext)();
export const use = /*@__PURE__*/ (() => BdApi.React.use)();
export const useEffect = /*@__PURE__*/ (() => BdApi.React.useEffect)();
export const useRef = /*@__PURE__*/ (() => BdApi.React.useRef)();
export const useSyncExternalStore = /*@__PURE__*/ (() => BdApi.React.useSyncExternalStore)();
export const memo = /*@__PURE__*/ (() => BdApi.React.memo)();
export const useCallback = /*@__PURE__*/ (() => BdApi.React.useCallback)();
export const cloneElement = /*@__PURE__*/ (() => BdApi.React.cloneElement)();
export const useMemo = /*@__PURE__*/ (() => BdApi.React.useMemo)();
export const useReducer = /*@__PURE__*/ (() => BdApi.React.useReducer)();
export const Children = /*@__PURE__*/ (() => BdApi.React.Children)();
export const forwardRef = /*@__PURE__*/ (() => BdApi.React.forwardRef)();
export const useLayoutEffect = /*@__PURE__*/ (() => BdApi.React.useLayoutEffect)();
export const createPortal = /*@__PURE__*/ (() => BdApi.ReactDOM.createPortal)();
export const unstable_batchedUpdates = /*@__PURE__*/ (() =>
	BdApi.ReactDOM.unstable_batchedUpdates)();

const React = /*@__PURE__*/ (() => BdApi.React)();

export default React;

export const NoopComponent = () => null;

export const LazyComponent = (get) => {
	const Comp = (props) => {
		const Component = get() ?? NoopComponent;
		return <Component {...props} />;
	};

	return Comp;
};

export function insertChild(el, child, index) {
	if (!el?.props?.children || !child) return;

	const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];

	el.props.children = add(children, child, index);
}


const SyncLane = 0b0010; // React 18: lane 1 is SyncHydrationLane, 2 is SyncLane

/** Mark fiber + its whole ancestor path so no memo/bailout can skip it. */
function markPath(fiber) {
	fiber.lanes |= SyncLane;
	if (fiber.alternate) fiber.alternate.lanes |= SyncLane;

	let node = fiber.return;
	while (node) {
		node.childLanes |= SyncLane;
		if (node.alternate) node.alternate.childLanes |= SyncLane;
		node = node.return;
	}
}

/** Nearest ancestor (inclusive) that can actually schedule an update. */
function findUpdater(fiber) {
	let node = fiber;
	while (node) {
		const inst = node.stateNode;
		if (inst && typeof inst.forceUpdate === "function") {
			return () => inst.forceUpdate();
		}

		let hook = node.memoizedState;
		while (hook) {
			const state = hook.memoizedState;
			// queue is null for useMemo/useCallback/useRef — only state hooks have a dispatch
			if (hook.queue?.dispatch && state !== null && typeof state === "object") {
				const dispatch = hook.queue.dispatch;
				return () => dispatch(Array.isArray(state) ? [...state] : { ...state });
			}
			hook = hook.next;
		}

		node = node.return;
	}
	return null;
}

function forceUpdateFiber(fiber) {
	if (!fiber) return false;

	const update = findUpdater(fiber);
	if (!update) return false;

	markPath(fiber);
	ReactDOM.flushSync(update);
	return true;
}

export function reRenderFiber(selector) {
	const target = document.querySelector(selector)?.parentElement;
	if (!target) return;
	forceUpdateFiber(getInternalInstance(target));
}

export function reRender(selector) {
	const target = document.querySelector(selector)?.parentElement;
	if (!target) return;
	const instance = getOwnerInstance(target);
	if (!instance) return;
	const unpatch = BdApi.Patcher.instead("RE_RENDER", instance, "render", () => unpatch());
	instance.forceUpdate(() => instance.forceUpdate());
}
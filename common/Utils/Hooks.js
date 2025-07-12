import { Children, useCallback, useEffect, useReducer, useRef, useState } from "@React";

export function usePropBasedState(prop) {
	const [state, setState] = useState(prop);
	useEffect(() => {
		setState(prop);
	}, [prop]);

	return [state, setState];
}

export const LengthStateEnum = {
	INCREASED: "INCREASED",
	UNCHANGED: "UNCHANGED",
	DECREASED: "DECREASED"
};

export function useNumberWatcher(num) {
	const lastNum = useRef(num);
	const currentNum = num;

	let state = "";
	if (lastNum.current < num) state = LengthStateEnum.INCREASED;
	else if (lastNum.current > currentNum) state = LengthStateEnum.DECREASED;
	else state = LengthStateEnum.UNCHANGED;
	lastNum.current = currentNum;
	return state;
}

export function useChildrenLengthStateChange(children) {
	const lastCount = useRef(Children.count(children));
	const currentCount = Children.count(children);

	let state = "";
	if (lastCount.current < currentCount) state = LengthStateEnum.INCREASED;
	else if (lastCount.current > currentCount) state = LengthStateEnum.DECREASED;
	else state = LengthStateEnum.UNCHANGED;
	lastCount.current = currentCount;
	return state;
}

export function useForceUpdate() {
	return useReducer(num => num + 1, 0);
}

export function useTimer(fn, delay) {
	const hideTimeoutId = useRef(null);

	const clear = useCallback(() => {
		if (hideTimeoutId.current === null) return;
		clearTimeout(hideTimeoutId.current);
		hideTimeoutId.current = null;
	}, []);

	const start = useCallback(() => {
		hideTimeoutId.current = setTimeout(() => {
			clear(); // clean first in case of exception
			fn();
		}, delay);
	}, [fn, delay]);

	useEffect(() => clear, []);

	return [start, clear];
}

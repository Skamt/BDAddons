import { Children, useRef, useReducer, useState, useEffect } from "@React";
import Settings from "@Utils/Settings";

export function useSettings(key) {
	const target = Settings.get(key);
	const [state, setState] = useState(target);
	useEffect(() => {
		function settingsChangeHandler() {
			const newVal = Settings.get(key);
			if (newVal !== state);
			setState(newVal);
		}
		return Settings.on(settingsChangeHandler);
	}, []);

	return state;
}

export function usePropBasedState(prop) {
	const [state, setState] = useState(prop);
	useEffect(() => {
		setState(prop);
	}, [prop]);

	return [state, setState];
}

export const LengthStateEnum = {
	INCREASED:"INCREASED",
	UNCHANGED:"UNCHANGED",
	DECREASED:"DECREASED",
}

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
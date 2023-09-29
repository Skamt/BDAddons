import { React } from "@Api";
import Settings from "@Utils/Settings";

export function useSettings(key) {
	const target = Settings.get(key);
	const [state, setState] = React.useState(target);
	React.useEffect(() => {
		function settingsChangeHandler() {
			const newVal = Settings.get(key);
			if (newVal !== state);
			setState(newVal);
		}
		return Settings.on(settingsChangeHandler);
	}, []);

	return state;
}

export function useStateFromStore(store, fn) {
	const [state, setState] = React.useState(fn() || null);
	React.useEffect(() => {
		function listener() {
			const newState = fn();
			if(newState === state) return;
			setState(newState);
		}
		store.addReactChangeListener(listener);
		return () => store.removeReactChangeListener(listener);
	}, [state]);

	return state;
}

export function useStateBasedProp(prop) {
	const [state, setState] = React.useState(prop);
	React.useEffect(() => {
		setState(prop);
	}, [prop]);

	return [state, setState];
}
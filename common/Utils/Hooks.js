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
	const [val, setVal] = React.useState(fn() || null);
	React.useEffect(() => {
		function listener() {
			setVal(fn());
		}
		store.addReactChangeListener(listener);
		return () => store.removeReactChangeListener(listener);
	}, []);

	return val;
}

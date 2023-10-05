import { React } from "@Api";
import { getModule } from "@Webpack";
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

export const useStateFromStores = getModule(Filters.byStrings("useStateFromStores"), { searchExports: true });

export function usePropBasedState(prop) {
	const [state, setState] = React.useState(prop);
	React.useEffect(() => {
		setState(prop);
	}, [prop]);

	return [state, setState];
}

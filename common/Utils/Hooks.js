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

export function useStateBasedProp(prop) {
	const [state, setState] = React.useState(prop);
	React.useEffect(() => {
		setState(prop);
	}, [prop]);

	return [state, setState];
}

export function useAnimationFrame(cb) {
	if (typeof performance === "undefined" || typeof window === "undefined") {
		return;
	}

	const cbRef = React.useRef();
	const frame = React.useRef();
	const init = React.useRef(performance.now());
	const last = React.useRef(performance.now());

	cbRef.current = cb;

	const animate = now => {
		// In seconds ~> you can do ms or anything in userland
		cbRef.current({
			time: (now - init.current) / 1000,
			delta: (now - last.current) / 1000
		});
		last.current = now;
		frame.current = requestAnimationFrame(animate);
	};

	React.useLayoutEffect(() => {
		frame.current = requestAnimationFrame(animate);
		return () => frame.current && cancelAnimationFrame(frame.current);
	}, []);
}

import { Patcher, React } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";
import Logger from "@Utils/Logger";
import Settings from "@Utils/Settings";
import { Filters, getModuleAndKey } from "@Webpack";
import SpotifyActivityControls from "../components/SpotifyActivityControls";

const ActivityComponent = getModuleAndKey(Filters.byStrings("shouldOpenGameProfile","UserActivity"), { defaultExport: true });

export default () => {
	const {module, key} = ActivityComponent;
	if (!module || !key) return Logger.patch("SpotifyActivityComponent");
		Patcher.before(module, key, (_, [props]) => {
			if (!Settings.getState().activity) return;
			if (!props.activity) return;
			if (props.activity.name.toLowerCase() !== "spotify") return;

			props.renderActions = () => (
				<ErrorBoundary id="SpotifyEmbed">
					<SpotifyActivityControls {...props} />
				</ErrorBoundary>
			);
		});
	
};

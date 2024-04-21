import { Patcher, React } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";
import Logger from "@Utils/Logger";
import Settings from "@Utils/Settings";
import { getModule } from "@Webpack";
import SpotifyActivityControls from "../components/SpotifyActivityControls";

const ActivityComponent = getModule(a => a.prototype.isStreamerOnTypeActivityFeed);

export default () => {
	if (ActivityComponent)
		Patcher.before(ActivityComponent.prototype, "render", ({ props }) => {
			if (!Settings.get("activity")) return;
			if (!props.activity) return;
			if (props.activity.name.toLowerCase() !== "spotify") return;

			props.renderActions = () => (
				<ErrorBoundary
					id="SpotifyEmbed"
					plugin={config.info.name}>
					<SpotifyActivityControls
						{...props}
					/>
				</ErrorBoundary>
			);
		});
	else Logger.patch("SpotifyActivityComponent");
};

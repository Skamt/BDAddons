import { React, Patcher } from "@Api";
import { getModule } from "@Webpack";
import Logger from "@Utils/Logger";
import ErrorBoundary from "@Components/ErrorBoundary";
import SpotifyActivityControls from "../components/SpotifyActivityControls";
const ActivityComponent = getModule(a => a.prototype.isStreamerOnTypeActivityFeed);

export default () => {
	if (ActivityComponent)
		Patcher.before(ActivityComponent.prototype, "render", ({ props }) => {
			if (!props.activity) return;
			if (props.activity.name.toLowerCase() !== "spotify") return;
			// console.log(props);

			const renderActions = props.renderActions;
			props.renderActions = () => (
				<ErrorBoundary
					id="SpotifyEmbed"
					plugin={config.info.name}>
					<SpotifyActivityControls
						{...props}
						renderActions={renderActions}
					/>
				</ErrorBoundary>
			);
		});
	else Logger.patch("SpotifyActivityComponent");
};

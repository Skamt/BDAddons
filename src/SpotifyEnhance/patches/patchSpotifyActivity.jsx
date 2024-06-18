import { Patcher, React } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";
import Logger from "@Utils/Logger";
import Settings from "@Utils/Settings";
import { Filters, getModule } from "@Webpack";
import SpotifyActivityControls from "../components/SpotifyActivityControls";

const ActivityComponent = getModule(Filters.byStrings("canSeeGameProfile", "useCanSeeGameProfile", "UserActivity"), { defaultExport: false });

export default () => {
	if (ActivityComponent)
		Patcher.before(ActivityComponent, "default", (_, [props]) => {
			if (!Settings.getState().activity) return;
			if (!props.activity) return;
			if (props.activity.name.toLowerCase() !== "spotify") return;

			props.renderActions = () => (
				<ErrorBoundary id="SpotifyEmbed">
					<SpotifyActivityControls {...props} />
				</ErrorBoundary>
			);
		});
	else Logger.patch("SpotifyActivityComponent");
};

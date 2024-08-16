import { Patcher, React } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";
import Logger from "@Utils/Logger";
import Settings from "@Utils/Settings";
import { Filters, getModuleAndKey } from "@Webpack";
import SpotifyActivityControls from "../components/SpotifyActivityControls";

const ActivityComponent = getModuleAndKey(Filters.byStrings("PRESS_LISTEN_ALONG_ON_SPOTIFY_BUTTON", "PRESS_PLAY_ON_SPOTIFY_BUTTON"));

export default () => {
	const { module, key } = ActivityComponent;
	if (!module || !key) return Logger.patch("SpotifyActivityComponent");
	Patcher.after(module, key, (_, [{ user, activity }]) => {
		if (!Settings.getState().activity) return;
		if (activity?.name.toLowerCase() !== "spotify") return;

		return (
			<ErrorBoundary id="SpotifyEmbed">
				<SpotifyActivityControls
					user={user}
					activity={activity}
				/>
			</ErrorBoundary>
		);
	});
};

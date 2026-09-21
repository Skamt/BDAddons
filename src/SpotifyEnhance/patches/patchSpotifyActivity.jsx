import React from "@React";
import {after} from "@common/Patcher";
import ErrorBoundary from "@Components/ErrorBoundary";
import Settings from "@Utils/Settings";
import { Filters, getDeclarationAndKey } from "@Webpack";
import SpotifyActivityControls from "@/components/SpotifyActivityControls";
import Plugin from "@common/Plugin";

const ActivityComponent = getDeclarationAndKey(Filters.bySource("PRESS_LISTEN_ALONG_ON_SPOTIFY_BUTTON", "PRESS_PLAY_ON_SPOTIFY_BUTTON"), Filters.byStrings("PRESS_LISTEN_ALONG_ON_SPOTIFY_BUTTON", "PRESS_PLAY_ON_SPOTIFY_BUTTON"));

Plugin.onStart(() => {
	after(...ActivityComponent, ({args:[{ user, activity }]}) => {
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
});

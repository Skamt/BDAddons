import { after } from "@common/Patcher";
import { Filters, lazy } from "@Webpack";
import React from "@React";
import ErrorBoundary from "@Components/ErrorBoundary";
import useStateFromStores from "@Modules/useStateFromStores";
import PresenceStore from "@Stores/PresenceStore";
import { SpotifyIcon } from "@Components/Icon";
import Tooltip from "@Components/Tooltip";
import Settings from "@Utils/Settings";
import Plugin from "@common/Plugin";

function SpotifyActivityIndicator({ userId }) {
	const activityIndicator = Settings(Settings.selectors.activityIndicator);
	const spotifyActivity = useStateFromStores([PresenceStore], () =>
		PresenceStore.getActivities(userId).find(
			(activity) => activity?.name?.toLowerCase() === "spotify",
		),
	);
	if (!activityIndicator || !spotifyActivity) return null;

	return (
		<Tooltip note={`${spotifyActivity.details} - ${spotifyActivity.state}`}>
			<SpotifyIcon width="20" height="20" class="spotifyActivityIndicatorIcon" />
		</Tooltip>
	);
}

Plugin.onStart(() => {
	lazy(Filters.byStrings("userOverride", "withMentionPrefix"), { searchExports: false }).then(
		(MessageHeader) => {
			after(...MessageHeader, ({ args: [{ message }], ret }) => {
				const userId = message.author.id;
				ret.props.children.push(
					<ErrorBoundary id="SpotifyActivityIndicator">
						<SpotifyActivityIndicator userId={userId} />
					</ErrorBoundary>,
				);
			});
		}
	);
});

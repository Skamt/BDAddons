import { React, Patcher } from "@Api";
import Logger from "@Utils/Logger";
import ErrorBoundary from "@Components/ErrorBoundary";
import MessageHeader from "@Patch/MessageHeader";
import PresenceStore from "@Stores/PresenceStore";
import SpotifyIcon from "@Components/icons/SpotifyIcon";
import Tooltip from "@Components/Tooltip";
import FluxHelpers from "@Modules/FluxHelpers";
import { useSettings } from "@Utils/Hooks";

function spotifyActivityFilter(activity) {
	return activity.name.toLowerCase() === "spotify";
}

function getUserActivity(userId, filter) {
	return PresenceStore.getActivities(userId).find(filter);
}

export default () => {
	const { module, key } = MessageHeader;
	if (module && key)
		Patcher.after(module, key, (_, [{ message }], ret) => {
			const userId = message.author.id;
			ret.props.children.push(
				<ErrorBoundary
					id="SpotifyActivityIndicator"
					plugin={config.info.name}>
					<SpotifyActivityIndicator userId={userId} />
				</ErrorBoundary>
			);
		});
	else Logger.patch("MessageHeader");
};

function SpotifyActivityIndicator({ userId }) {
	const activityIndicator = useSettings("activityIndicator");
	const spotifyActivity = FluxHelpers.useStateFromStores([PresenceStore], () => getUserActivity(userId, spotifyActivityFilter));
	if (!activityIndicator || !spotifyActivity) return null;

	return (
		<Tooltip note={`${spotifyActivity.details} - ${spotifyActivity.state}`}>
			<SpotifyIcon
				width="20"
				height="20"
				class="spotifyActivityIndicatorIcon"
			/>
		</Tooltip>
	);
}

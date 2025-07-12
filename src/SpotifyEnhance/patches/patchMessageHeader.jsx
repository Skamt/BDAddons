import { React, Patcher } from "@Api";

import Logger from "@Utils/Logger";
import ErrorBoundary from "@Components/ErrorBoundary";
import MessageHeader from "@Patch/MessageHeader";
import useStateFromStores from "@Modules/useStateFromStores";
import PresenceStore from "@Stores/PresenceStore";
import SpotifyIcon from "@Components/icons/SpotifyIcon";
import Tooltip from "@Components/Tooltip";
import Settings from "@Utils/Settings";
import Plugin, { Events } from "@Utils/Plugin";

function SpotifyActivityIndicator({ userId }) {
	const activityIndicator = Settings(Settings.selectors.activityIndicator);
	const spotifyActivity = useStateFromStores([PresenceStore], () => PresenceStore.getActivities(userId).find(activity => activity?.name?.toLowerCase() === "spotify"));
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

Plugin.on(Events.START, () => {
	const { module, key } = MessageHeader;
	if (!module || !key) return Logger.patchError("MessageHeader");
	const unpatch = Patcher.after(module, key, (_, [{ message }], ret) => {
		const userId = message.author.id;
		ret.props.children.push(
			<ErrorBoundary id="SpotifyActivityIndicator">
				<SpotifyActivityIndicator userId={userId} />
			</ErrorBoundary>
		);
	});

	Plugin.once(Events.STOP, unpatch);
});

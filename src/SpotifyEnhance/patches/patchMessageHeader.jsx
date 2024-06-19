import { React, Patcher } from "@Api";
import { getModule, Filters } from "@Webpack";
import Logger from "@Utils/Logger";
import ErrorBoundary from "@Components/ErrorBoundary";
import MessageHeader from "@Patch/MessageHeader";
import PresenceStore from "@Stores/PresenceStore";
import SpotifyIcon from "@Components/icons/SpotifyIcon";
import Tooltip from "@Components/Tooltip";
import Settings from "@Utils/Settings";

const useStateFromStores = getModule(Filters.byStrings("useStateFromStores"), { searchExports: true });

export default () => {
	const { module, key } = MessageHeader;
	if (module && key)
		Patcher.after(module, key, (_, [{ message }], ret) => {
			const userId = message.author.id;
			ret.props.children.push(
				<ErrorBoundary id="SpotifyActivityIndicator">
					<SpotifyActivityIndicator userId={userId} />
				</ErrorBoundary>
			);
		});
	else Logger.patch("MessageHeader");
};

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

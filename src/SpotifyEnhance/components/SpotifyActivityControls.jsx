import { React } from "@Api";
import { Filters, getModule } from "@Webpack";

import SpotifyStore from "@Stores/SpotifyStore";
import SpotifyWrapper from "../SpotifyWrapper";
import Button from "@Components/Button";
import AddToQueueIcon from "@Components/AddToQueueIcon";
import ListenAlongIcon from "@Components/ListenAlongIcon";
import ListenIcon from "@Components/ListenIcon";
import ShareIcon from "@Components/ShareIcon";
import Tooltip from "@Components/Tooltip";

import useStateFromStores from "@Modules/useStateFromStores";

const getUserSyncActivityState = getModule(Filters.byStrings("USER_ACTIVITY_SYNC", "spotifyData"), { searchExports: true });
const getUserPlayActivityState = getModule(Filters.byStrings("USER_ACTIVITY_PLAY", "spotifyData"), { searchExports: true });

function ActivityControlButton({ value, onClick, ...rest }) {
	return (
		<Button
			size={Button.Sizes.NONE}
			color={Button.Colors.PRIMARY}
			onClick={onClick}
			{...rest}>
			{value}
		</Button>
	);
}

export default ({ activity, user, source, renderActions }) => {
	const spotifySocket = useStateFromStores([SpotifyStore], () => SpotifyStore.getActiveSocketAndDevice()?.socket);
	
	const userSyncActivityState = getUserSyncActivityState(activity, user, source);
	const userPlayActivityState = getUserPlayActivityState(activity, user, source);

	if (!spotifySocket) return renderActions();

	const queue = () => SpotifyWrapper.Player.queue("track", activity.sync_id, activity.details);
	const share = () => SpotifyWrapper.Utils.share(`https://open.spotify.com/track/${activity.sync_id}`);

	return (
		<div className="spotify-activity-controls">
			<Play userPlayActivityState={userPlayActivityState} />
			<Tooltip note="Add to queue">
				<ActivityControlButton
					className="activity-controls-queue"
					value={<AddToQueueIcon />}
					onClick={queue}
				/>
			</Tooltip>
			<Tooltip note="Share in current channel">
				<ActivityControlButton
					className="activity-controls-share"
					onClick={share}
					value={<ShareIcon />}
				/>
			</Tooltip>
			<ListenAlong userSyncActivityState={userSyncActivityState} />
		</div>
	);
};

function Play({ userPlayActivityState }) {
	const { label,disabled, onClick, tooltip } = userPlayActivityState;

	return (
		<Tooltip note={tooltip || label}>
			<ActivityControlButton
				disabled={disabled}
				className="activity-controls-listen"
				value={<ListenIcon />}
				onClick={onClick}
			/>
		</Tooltip>
	);
}

function ListenAlong({ userSyncActivityState }) {
	const { disabled, onClick, tooltip } = userSyncActivityState;

	return (
		<Tooltip note={tooltip}>
			<ActivityControlButton
				className="activity-controls-listenAlong"
				disabled={disabled}
				onClick={e => onClick(e)}
				value={<ListenAlongIcon />}
			/>
		</Tooltip>
	);
}

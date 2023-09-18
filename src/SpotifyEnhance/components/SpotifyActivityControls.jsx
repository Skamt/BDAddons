import { React, Patcher } from "@Api";
import Toast from "@Utils/Toast";
import SpotifyStore from "@Stores/SpotifyStore";
import UserStore from "@Stores/UserStore";
import SelectedChannelStore from "@Stores/SelectedChannelStore";
import { sendMessageDirectly, insertText } from "@Utils/Messages";
import SpotifyWrapper from "../SpotifyWrapper";
import Button from "@Components/Button";
import AddToQueueIcon from "@Components/AddToQueueIcon";
import ListenAlongIcon from "@Components/ListenAlongIcon";
import ListenIcon from "@Components/ListenIcon";
import ShareIcon from "@Components/ShareIcon";
import Tooltip from "@Components/Tooltip";
import { useStateFromStore } from "@Utils/Hooks";

const getUserSyncActivityState = getModule(Filters.byStrings("USER_ACTIVITY_SYNC", "spotifyData"), { searchExports: true });
const getUserPlayActivityState = getModule(Filters.byStrings("USER_ACTIVITY_PLAY", "spotifyData"), { searchExports: true });

function ControlBtn({ value, onClick, ...rest }) {
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
	const spotifySocket = useStateFromStore(SpotifyStore, () => SpotifyStore.getActiveSocketAndDevice()?.socket);
	if (!spotifySocket) return renderActions();
	const userSyncActivityState = getUserSyncActivityState(activity, user, source);
	const userPlayActivityState = getUserPlayActivityState(activity, user, source);

	// console.log(userSyncActivityState);

	const queue = () => SpotifyWrapper.queue("track", activity.sync_id, activity.details);

	const share = () => {
		const id = SelectedChannelStore.getCurrentlySelectedChannelId();
		if (!id) return;
		const content = `https://open.spotify.com/track/${activity.sync_id}`;
		sendMessageDirectly({ id }, content).catch(a => {
			Toast.error(a.message);
			insertText(content);
		});
	};

	return (
		<div className="spotify-activity-controls">
			<Play userPlayActivityState={userPlayActivityState} />
			<Tooltip note="Add to queue">
				<ControlBtn
					className="activity-controls-queue"
					value={<AddToQueueIcon />}
					onClick={queue}
				/>
			</Tooltip>
			<Tooltip note="Share in current channel">
				<ControlBtn
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
	const { disabled, onClick, tooltip } = userPlayActivityState;

	return (
		<Tooltip note={tooltip}>
			<ControlBtn
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
			<ControlBtn
				className="activity-controls-listenAlong"
				disabled={disabled}
				onClick={e => onClick(e)}
				value={<ListenAlongIcon />}
			/>
		</Tooltip>
	);
}

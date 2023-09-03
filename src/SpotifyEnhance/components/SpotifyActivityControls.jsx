import { React, Patcher } from "@Api";
import Toast from "@Utils/Toast";
import SpotifyStore from "@Stores/SpotifyStore";
import UserStore from "@Stores/UserStore";
import SelectedChannelStore from "@Stores/SelectedChannelStore";
import { sendMessageDirectly, insertText } from "@Utils/Messages";
import { copySpotifyLink, listen, queue } from "../SpotifyWrapper";
import Button from "@Components/Button";
import AddToQueueIcon from "@Components/AddToQueueIcon";
import ListenAlongIcon from "@Components/ListenAlongIcon";
import ListenIcon from "@Components/ListenIcon";
import ShareIcon from "@Components/ShareIcon";
import Tooltip from "@Components/Tooltip";

const getUserSyncActivityState = getModule(Filters.byStrings("USER_ACTIVITY_SYNC", "spotifyData"), { searchExports: true });

function ControlBtn({ value, onClick, ...rest }) {
	return (
		<Button
			size={Button.Sizes.ICON}
			color={Button.Colors.GREEN}
			onClick={onClick}
			{...rest}>
			{value}
		</Button>
	);
}

export default ({ activity, user, source }) => {
	const userSyncActivityState = getUserSyncActivityState(activity, user, source);
	const {
		spotifyData: { isCurrentUser },
		disabled,
		onClick,
		tooltip,
	} = userSyncActivityState;

	// console.log(userSyncActivityState);

	const play = () => listen("track", activity.sync_id, activity.details);
	const queue = () => queue("track", activity.sync_id, activity.details);

	const share = () => {
		const id = SelectedChannelStore.getCurrentlySelectedChannelId();
		if (!id) return;
		const content = `https://open.spotify.com/track/${activity.sync_id}`;
		sendMessageDirectly({ id }, content)
			.catch(a => {
				Toast.error(a.message);
				insertText(content);
			});
	};

	return (
		<div className="activity-controls">
			{!isCurrentUser && (
				<Tooltip note="Play on Spotify">
					<ControlBtn
						className="activity-controls-listen"
						value={<ListenIcon />}
						onClick={play}
					/>
				</Tooltip>
			)}
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

			{!isCurrentUser && (
				<Tooltip note={tooltip}>
					<ControlBtn
						className="activity-controls-listenAlong"
						disabled={disabled}
						onClick={e => onClick(e)}
						value={<ListenAlongIcon />}
					/>
				</Tooltip>
			)}
		</div>
	);
};

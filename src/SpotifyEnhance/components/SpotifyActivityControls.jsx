import { React } from "@Api";
import Button from "@Components/Button";
import Tooltip from "@Components/Tooltip";
import AddToQueueIcon from "@Components/icons/AddToQueueIcon";
import ListenAlongIcon from "@Components/icons/ListenAlongIcon";
import ListenIcon from "@Components/icons/ListenIcon";
import ShareIcon from "@Components/icons/ShareIcon";
import { Filters, getModule } from "@Webpack";
import SpotifyApi from "../SpotifyAPIWrapper";
import { Store } from "../Store";

const { useSpotifyPlayAction, useSpotifySyncAction } = getModule(Filters.byProps("useSpotifyPlayAction"));

export default ({ activity, user, source }) => {
	const isActive = Store(Store.selectors.isActive);

	const userSyncActivityState = useSpotifySyncAction(activity, user, source);
	const userPlayActivityState = useSpotifyPlayAction(activity, user, source);

	return (
		<div className="spotify-activity-controls">
			<Play userPlayActivityState={userPlayActivityState} />
			<Tooltip note="Add to queue">
				<ActivityControlButton
					className="activity-controls-queue"
					value={<AddToQueueIcon />}
					disabled={!isActive}
					onClick={() => SpotifyApi.queue(activity?.metadata?.type, activity.sync_id, activity.details)}
				/>
			</Tooltip>
			<Tooltip note="Share in current channel">
				<ActivityControlButton
					className="activity-controls-share"
					onClick={() => Store.Utils.share(`https://open.spotify.com/track/${activity.sync_id}`)}
					value={<ShareIcon />}
				/>
			</Tooltip>
			<ListenAlong userSyncActivityState={userSyncActivityState} />
		</div>
	);
};

function Play({ userPlayActivityState }) {
	const { label, disabled, onClick, tooltip } = userPlayActivityState;

	return (
		<Tooltip note={tooltip || label}>
			<ActivityControlButton
				disabled={disabled}
				fullWidth={true}
				grow={true}
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

function ActivityControlButton({ grow, value, onClick, ...rest }) {
	return (
		<Button
			innerClassName="flexCenterCenter"
			size={Button.Sizes.NONE}
			color={Button.Colors.PRIMARY}
			look={Button.Colors.OUTLINED}
			onClick={onClick}
			grow={grow || false}
			{...rest}>
			{value}
		</Button>
	);
}

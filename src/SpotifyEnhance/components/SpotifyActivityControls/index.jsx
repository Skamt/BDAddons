import "./styles";
import React from "@React";
import ActivityControlButton from "./ActivityControlButton";
import ListenAlong from "./ListenAlong";
import Play from "./Play";

import Tooltip from "@Components/Tooltip";
import AddToQueueIcon from "@Components/icons/AddToQueueIcon";
import ShareIcon from "@Components/icons/ShareIcon";
import { Filters, getMangled } from "@Webpack";

import { Store } from "@/Store";

const { useSpotifyPlayAction, useSpotifySyncAction } = getMangled(
	Filters.byStrings("USER_ACTIVITY_PLAY", "spotifyData", "tooltip"),
	{
		useSpotifyPlayAction: Filters.byStrings("USER_ACTIVITY_PLAY"),
		useSpotifySyncAction: Filters.byStrings("USER_ACTIVITY_SYNC")
	},
	{ searchExports: true, raw: true }
);

export default ({ activity, user }) => {
	const isActive = Store(Store.selectors.isActive);

	const userSyncActivityState = useSpotifySyncAction(activity, user);
	const userPlayActivityState = useSpotifyPlayAction(activity, user);

	return (
		<div className="spotify-activity-controls">
			<Play userPlayActivityState={userPlayActivityState} />
			<Tooltip note="Add to queue">
				<ActivityControlButton
					className="spotify-activity-btn-queue"
					value={<AddToQueueIcon />}
					disabled={!isActive}
					onClick={() => Store.Api.queue("track", activity.sync_id, activity.details)}
				/>
			</Tooltip>
			<Tooltip note="Share in current channel">
				<ActivityControlButton
					className="spotify-activity-btn-share"
					onClick={() => Store.Utils.share(`https://open.spotify.com/track/${activity.sync_id}`)}
					value={<ShareIcon />}
				/>
			</Tooltip>
			<ListenAlong userSyncActivityState={userSyncActivityState} />
		</div>
	);
};

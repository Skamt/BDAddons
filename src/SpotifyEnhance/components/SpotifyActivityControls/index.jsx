import "./styles";
import React from "@React";
import Button from "@Components/Button";
import ControlButton from "../ControlButton";
import Popout from "@Components/Popout";
import { ListenAlongIcon, ListenIcon, AddToQueueIcon, ShareIcon } from "@Components/Icon";
import { Filters, getMangled } from "@Webpack";
import Store from "@/store";
import { classNameFactory } from "@Utils/css";
import { preventDefault, nop } from "@Utils";
import { ContextMenu } from "@Api";
import { copyMenu, shareMenu } from "@/contextmenu.js";

const c = classNameFactory("spotify-activity");

const { useSpotifyPlayAction, useSpotifySyncAction } = getMangled(
	Filters.byStrings("USER_ACTIVITY_PLAY", "spotifyData", "tooltip"),
	{
		useSpotifyPlayAction: Filters.byStrings("USER_ACTIVITY_PLAY"),
		useSpotifySyncAction: Filters.byStrings("USER_ACTIVITY_SYNC")
	},
	{ searchExports: true, raw: true }
);

export default ({ activity, user }) => {
	const userSyncActivityState = useSpotifySyncAction(activity, user);
	const userPlayActivityState = useSpotifyPlayAction(activity, user);
	const isActive = Store(Store.selectors.isActive);
	const url = `https://open.spotify.com/track/${activity?.sync_id}`;
	const bannerUrl = React.useMemo(() => `https://i.scdn.co/image/${activity?.assets?.large_image?.replace("spotify:", "")}`, [activity?.assets?.large_image]);

	return (
		<div className={c("controls")}>
			<ControlButton
				tooltip={userPlayActivityState.tooltip || userPlayActivityState.label}
				disabled={userPlayActivityState.disabled}
				fullWidth={true}
				className={c("btn", "btn-listen")}
				look={Button.Colors.OUTLINED}
				value={<ListenIcon />}
				onClick={userPlayActivityState.onClick}
			/>

			<ControlButton
				tooltip="Add to queue"
				className={c("btn", "btn-queue")}
				look={Button.Colors.OUTLINED}
				value={<AddToQueueIcon />}
				disabled={!isActive}
				onClick={() => Store.Api.queue("track", activity.sync_id, activity.details)}
			/>

			<Popout
				align="right"
				renderPopout={e => (
					<div onClick={preventDefault(nop)}>
						<ContextMenu.Menu onClose={e.closePopout}>{ContextMenu.buildMenuChildren([copyMenu(url, bannerUrl), shareMenu(url, bannerUrl)])}</ContextMenu.Menu>
					</div>
				)}>
				{e => (
					<ControlButton
						tooltip="Share"
						onClick={e.onClick}
						look={Button.Colors.OUTLINED}
						className={c("btn", "btn-share")}
						value={<ShareIcon />}
					/>
				)}
			</Popout>

			<ControlButton
				tooltip={userSyncActivityState.tooltip}
				className={c("btn", "btn-listenAlong")}
				disabled={userSyncActivityState.disabled}
				onClick={userSyncActivityState.onClick}
				look={Button.Colors.OUTLINED}
				value={<ListenAlongIcon />}
			/>
		</div>
	);
};

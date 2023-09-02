import { React, Patcher } from "@Api";
import Toast from "@Utils/Toast";
import SpotifyStore from "@Stores/SpotifyStore";
import UserStore from "@Stores/UserStore";
import SelectedChannelStore from "@Stores/SelectedChannelStore";
import ChannelStore from "@Stores/ChannelStore";
import { sendMessageDirectly, insertText } from "@Utils/Messages";
import SpotifyAPI from "@Utils/SpotifyAPI";
import { copySpotifyLink, listen, queue } from "../SpotifyWrapper";
import Button from "@Components/Button";
import AddToQueueIcon from "@Components/AddToQueueIcon";
import ListenAlongIcon from "@Components/ListenAlongIcon";
import ListenIcon from "@Components/ListenIcon";

const test = s.moduleById(742456).exports.Fe;

function ControlBtn({ value, onClick, ...p }) {
	return (
		<Button
			size={Button.Sizes.ICON}
			color={Button.Colors.GREEN}
			onClick={onClick}
			{...p}>
			{value}
		</Button>
	);
}

export default props => {
	var t = props.activity,
		n = props.user,
		s = props.source;
	const { tooltip, loading, disabled, onClick } = test(t, n, s);

	const play = () => listen("track", t.sync_id, t.details);
	const queue = () => queue("track", t.sync_id, t.details);
	const share = () => {
		const selectedChannel = SelectedChannelStore.getCurrentlySelectedChannelId();
		if (!selectedChannel) return;
		const channel = ChannelStore.getChannel(selectedChannel);
		const track = SpotifyStore.getTrack();
		const content = `https://open.spotify.com/track/${track.id}`;
		try {
			sendMessageDirectly(channel, content);
		} catch {
			Toast.error("Could not send directly.");
			insertText(content);
		}
	};

	return (
		<div className="activity-controls">
			<ControlBtn
				className="activity-controls-listen"
				value={<ListenIcon />}
				onClick={play}
			/>
			<ControlBtn
				className="activity-controls-queue"
				value={<AddToQueueIcon />}
				onClick={queue}
			/>
			<ControlBtn
				className="activity-controls-share"
				onClick={share}
				value="Share"
			/>

			<ControlBtn
				className="activity-controls-listenAlong"
				disabled={disabled}
				onClick={e => onClick(e)}
				value={<ListenAlongIcon />}
			/>
		</div>
	);
};

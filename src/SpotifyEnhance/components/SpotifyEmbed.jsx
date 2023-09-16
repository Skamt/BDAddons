import { React } from "@Api";
import { getImageModalComponent, openModal, copy } from "@Utils";
import Toast from "@Utils/Toast";
import { parseSpotifyUrl } from "../Utils.js";
import SpotifyWrapper from "../SpotifyWrapper";
import { ActionsEnum } from "../consts.js";

import AddToQueueIcon from "@Components/AddToQueueIcon";
import CopyIcon from "@Components/CopyIcon";
import ListenIcon from "@Components/ListenIcon";
import SpotifyIcon from "@Components/SpotifyIcon";

import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import Tooltip from "@Components/Tooltip";
import TimeBar from "@Components/TimeBar";

function useHook() {
	const [state, setState] = React.useState(SpotifyWrapper.getDeviceState());
	React.useEffect(() => {
		return SpotifyWrapper.on("DEVICE", () => setState(SpotifyWrapper.getDeviceState()));
	}, []);
	return state;
}

export default ({ embed }) => {
	const { thumbnail, rawTitle, rawDescription, url } = embed;
	const [type, id] = parseSpotifyUrl(url);
	const isActive = useHook();

	const thumbnailClickHandler = () => {
		let { url, width, height } = thumbnail;
		width = width > 650 ? 650 : width;
		height = height > 650 ? 650 : height;
		openModal(getImageModalComponent(url, { width: width, height: height }));
	};

	const listenBtn = type !== "show" && (
		<Listen
			type={type}
			id={id}
			embed={embed}
		/>
	);

	const queueBtn = (type === "track" || type === "episode") && (
		<AddToQueue
			type={type}
			id={id}
			embed={embed}
		/>
	);

	return (
		<div
			class="spotifyEmbed-Container"
			style={{ "--thumbnail": `url(${thumbnail.url})` }}>
			<div
				onClick={thumbnailClickHandler}
				className="spotifyEmbed-thumbnail"
			></div>

			<h2 className="spotifyEmbed-title">{rawTitle}</h2>
			<p className="spotifyEmbed-description">{rawDescription}</p>

			<div className="spotifyEmbed-controls">
				{isActive && [listenBtn, queueBtn]}
				<Copy url={url} />
				{/*<TrackTimeBar
						id={id}
						embed={embed}
					/>*/}
			</div>

			<SpotifyLogoBtn url={url} />
		</div>
	);
};

function SpotifyLogoBtn({ url }) {
	return (
		<Tooltip
			note="Play on Spotify"
			position="top">
			<div
				onClick={() => SpotifyWrapper.Utils.openSpotifyLink(url)}
				className="spotifyEmbed-spotifyIcon">
				<SpotifyIcon />
			</div>
		</Tooltip>
	);
}

function Copy({ url }) {
	return (
		<Tooltip
			note="Copy link"
			position="top">
			<div
				onClick={() => SpotifyWrapper.Utils.copySpotifyLink(url)}
				className="spotifyEmbed-btn spotifyEmbed-btn-copy">
				<CopyIcon />
			</div>
		</Tooltip>
	);
}
function Listen({ type, id, embed }) {
	return (
		<Tooltip
			note={`Play ${type}`}
			position="top">
			<div
				onClick={() => SpotifyWrapper.play(type, id, embed.rawTitle)}
				className="spotifyEmbed-btn spotifyEmbed-btn-listen">
				<ListenIcon />
			</div>
		</Tooltip>
	);
}

function AddToQueue({ type, id, embed }) {
	return (
		<Tooltip
			note={`Add ${type} to queue`}
			position="top">
			<div
				onClick={() => SpotifyWrapper.queue(type, id, embed.rawTitle)}
				className="spotifyEmbed-btn spotifyEmbed-btn-addToQueue">
				<AddToQueueIcon />
			</div>
		</Tooltip>
	);
}

function TrackTimeBar({ id }) {
	// const activity = useStateFromStore(SpotifyStore, () => SpotifyStore.getActivity());
	// if (!activity || activity.sync_id !== id) return null;

	return (
		<div className="spotifyEmbed-timeBar">
			<TimeBar
				{...activity.timestamps}
				onSeek={seek}
				className="timeBarUserPopoutV2-32DL06"
			/>
		</div>
	);
}

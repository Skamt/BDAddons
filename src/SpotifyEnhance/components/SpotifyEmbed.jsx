import { React } from "@Api";
import { getImageModalComponent, openModal, copy } from "@Utils";
import Toast from "@Utils/Toast";
import { parseSpotifyUrl } from "../Utils.js";
import { copySpotifyLink, listen, queue } from "../SpotifyWrapper";
import { ActionsEnum } from "../consts.js";
import AddToQueueIcon from "@Components/AddToQueueIcon";
import CopyIcon from "@Components/CopyIcon";
import ListenIcon from "@Components/ListenIcon";
import SpotifyIcon from "@Components/SpotifyIcon";
import { useStateFromStore } from "@Utils/Hooks";
import SpotifyStore from "@Stores/SpotifyStore";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import TimeBar from "@Modules/TimeBar";
import Tooltip from "@Components/Tooltip";

export default ({ embed }) => {
	const { thumbnail, rawTitle, rawDescription, url } = embed;
	const [type, id] = parseSpotifyUrl(url);
	const spotifySocket = useStateFromStore(SpotifyStore, () => SpotifyStore.getActiveSocketAndDevice()?.socket);

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
			/>
			<div className="spotifyEmbed-details">
				<div className="spotifyEmbed-info">
					<h2 className="spotifyEmbed-title">{rawTitle}</h2>
					<p className="spotifyEmbed-description">{rawDescription}</p>
				</div>
				<div className="spotifyEmbed-controls">
					{spotifySocket && [listenBtn, queueBtn]}
					<Copy url={url} />
					<TrackTimeBar
						id={id}
						embed={embed}
					/>
				</div>
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
				onClick={() => window.open(url, "_blank")}
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
				onClick={() => copySpotifyLink(url)}
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
				onClick={() => listen(type, id, embed.rawTitle)}
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
				onClick={() => queue(type, id, embed.rawTitle)}
				className="spotifyEmbed-btn spotifyEmbed-btn-addToQueue">
				<AddToQueueIcon />
			</div>
		</Tooltip>
	);
}

function TrackTimeBar({ id }) {
	const activity = useStateFromStore(SpotifyStore, () => SpotifyStore.getActivity());
	if (!activity || activity.sync_id !== id) return null;
	return (
		<div className="spotifyEmbed-timeBar">
			<TimeBar
				{...activity.timestamps}
				className="timeBarUserPopoutV2-32DL06"
			/>
		</div>
	);
}

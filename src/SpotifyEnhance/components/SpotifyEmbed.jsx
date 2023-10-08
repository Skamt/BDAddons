import { React } from "@Api";
import { getImageModalComponent, openModal } from "@Utils";

import { parseSpotifyUrl } from "../Utils.js";
import SpotifyWrapper from "../SpotifyWrapper";
import AddToQueueIcon from "@Components/AddToQueueIcon";
import CopyIcon from "@Components/CopyIcon";
import ListenIcon from "@Components/ListenIcon";
import SpotifyIcon from "@Components/SpotifyIcon";
import Tooltip from "@Components/Tooltip";
import TrackTimeLine from "./TrackTimeLine";

export default ({ embed }) => {
	const [{ deviceState: isActive, playerState }, setState] = React.useState(SpotifyWrapper.getSpotifyState());

	React.useEffect(() => {
		return SpotifyWrapper.on(() => {
			const newState = SpotifyWrapper.getSpotifyState();
			if (newState.deviceState === isActive && newState?.playerState?.track?.id === playerState?.track?.id) return;
			setState(newState);
		});
	}, []);

	const { thumbnail, rawTitle, rawDescription, url } = embed;
	const [type, id] = parseSpotifyUrl(url);
	const isThis = playerState?.track?.id === id;

	const thumbnailClickHandler = () => {
		let { proxyURL, url, width, height } = thumbnail;
		width = width > 650 ? 650 : width;
		height = height > 650 ? 650 : height;
		openModal(getImageModalComponent(proxyURL || url, { width, height }));
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

	const { duration, isPlaying, progress } = playerState;

	return (
		<div
			className="spotifyEmbed-Container"
			style={{ "--thumbnail": `url(${thumbnail.proxyURL || thumbnail.url})` }}>
			<div
				onClick={thumbnailClickHandler}
				className="spotifyEmbed-thumbnail"></div>

			<h2 className="spotifyEmbed-title">{rawTitle}</h2>
			<p className="spotifyEmbed-description">{rawDescription}</p>

			{type && id && (
				<div className="spotifyEmbed-controls">
					{!isThis && isActive && [listenBtn, queueBtn]}
					{isThis && <TrackTimeLine {...{ duration, isPlaying, progress }} />}
					<Copy url={url} />
				</div>
			)}
			<SpotifyLogoBtn url={url} />
		</div>
	);
};

function SpotifyLogoBtn({ url }) {
	return (
		<Tooltip note="Play on Spotify">
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
		<Tooltip note="Copy link">
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
		<Tooltip note={`Play ${type}`}>
			<div
				onClick={() => SpotifyWrapper.Player.listen(type, id, embed.rawTitle)}
				className="spotifyEmbed-btn spotifyEmbed-btn-listen">
				<ListenIcon />
			</div>
		</Tooltip>
	);
}

function AddToQueue({ type, id, embed }) {
	return (
		<Tooltip note={`Add ${type} to queue`}>
			<div
				onClick={() => SpotifyWrapper.Player.queue(type, id, embed.rawTitle)}
				className="spotifyEmbed-btn spotifyEmbed-btn-addToQueue">
				<AddToQueueIcon />
			</div>
		</Tooltip>
	);
}

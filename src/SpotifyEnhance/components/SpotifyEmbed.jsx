import { React } from "@Api";
import { getImageModalComponent, openModal } from "@Utils";

import { parseSpotifyUrl } from "../Utils.js";
import SpotifyWrapper from "../SpotifyWrapper";
import AddToQueueIcon from "@Components/icons/AddToQueueIcon";
import CopyIcon from "@Components/icons/CopyIcon";
import ListenIcon from "@Components/icons/ListenIcon";
import SpotifyIcon from "@Components/icons/SpotifyIcon";
import Tooltip from "@Components/Tooltip";

export default ({ embed: { thumbnail = {}, rawTitle, rawDescription, url } }) => {
	const [type, id] = parseSpotifyUrl(url);
	console.log(rawTitle);

	const [isActive, setIsActive] = React.useState(SpotifyWrapper.getActiveState());
	const [isThis, setIsThis] = React.useState(SpotifyWrapper.getEmbedData(id));

	React.useEffect(() => {
		return SpotifyWrapper.on(() => {
			const newState = SpotifyWrapper.getEmbedData(id);
			if (newState !== isThis) setIsThis(newState);
		});
	}, [isThis]);

	React.useEffect(() => {
		return SpotifyWrapper.on(() => {
			const newState = SpotifyWrapper.getActiveState(id);
			if (newState !== isActive) setIsActive(newState);
		});
	}, [isActive]);

	const listenBtn = type !== "show" && (
		<Listen
			type={type}
			id={id}
			tag={rawTitle}
		/>
	);

	const queueBtn = (type === "track" || type === "episode") && (
		<AddToQueue
			type={type}
			id={id}
			tag={rawTitle}
		/>
	);

	let className = "spotifyEmbed-Container";
	if (isThis) className += " playing";

	return (
		<div
			className={className}
			style={{ "--thumbnail": `url(${thumbnail.proxyURL || thumbnail.url})` }}>
			<Tooltip note="View">
				<div
					onClick={() => {
						let { proxyURL, url, width, height } = thumbnail;
						width = width > 650 ? 650 : width;
						height = height > 650 ? 650 : height;
						openModal(<div className="spotify-banner-modal">{getImageModalComponent(proxyURL || url, { width, height })}</div>);
					}}
					className="spotifyEmbed-thumbnail"></div>
			</Tooltip>
			<h2 className="spotifyEmbed-title">{rawTitle}</h2>
			<p className="spotifyEmbed-description">{rawDescription}</p>

			{type && id && (
				<div className="spotifyEmbed-controls">
					{!isThis && isActive && [listenBtn, queueBtn]}
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

function Listen({ type, id, tag }) {
	return (
		<Tooltip note={`Play ${type}`}>
			<div
				onClick={() => SpotifyWrapper.Player.listen(type, id, tag)}
				className="spotifyEmbed-btn spotifyEmbed-btn-listen">
				<ListenIcon />
			</div>
		</Tooltip>
	);
}

function AddToQueue({ type, id, tag }) {
	return (
		<Tooltip note={`Add ${type} to queue`}>
			<div
				onClick={() => SpotifyWrapper.Player.queue(type, id, tag)}
				className="spotifyEmbed-btn spotifyEmbed-btn-addToQueue">
				<AddToQueueIcon />
			</div>
		</Tooltip>
	);
}

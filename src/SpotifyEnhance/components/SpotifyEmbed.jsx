import { React } from "@Api";
import Tooltip from "@Components/Tooltip";
import AddToQueueIcon from "@Components/icons/AddToQueueIcon";
import CopyIcon from "@Components/icons/CopyIcon";
import ListenIcon from "@Components/icons/ListenIcon";
import SpotifyIcon from "@Components/icons/SpotifyIcon";
import { getImageModalComponent, openModal } from "@Utils";
import SpotifyApi from "../SpotifyAPIWrapper";
import { Store } from "../Store";

export default ({ id, type, embed: { thumbnail, rawTitle, rawDescription, url } }) => {
	const isPlaying = Store(Store.selectors.isPlaying);
	const isActive = Store(Store.selectors.isActive);
	const mediaId = Store(Store.selectors.mediaId, (n, o) => n === o || (n !== id && o !== id));
	const isThis = mediaId === id;

	const listenBtn = type !== "show" && (
		<Tooltip note={`Play ${type}`}>
			<div
				onClick={() => SpotifyApi.listen(type, id, rawTitle)}
				className="spotifyEmbed-btn spotifyEmbed-btn-listen">
				<ListenIcon />
			</div>
		</Tooltip>
	);

	const queueBtn = (type === "track" || type === "episode") && (
		<Tooltip note={`Add ${type} to queue`}>
			<div
				onClick={() => SpotifyApi.queue(type, id, rawTitle)}
				className="spotifyEmbed-btn spotifyEmbed-btn-addToQueue">
				<AddToQueueIcon />
			</div>
		</Tooltip>
	);

	let className = "spotifyEmbed-Container";
	if (isThis && isPlaying) className += " playing";

	return (
		<div
			className={className}
			style={{ "--thumbnail": `url(${thumbnail?.proxyURL || thumbnail?.url})` }}>
			<Tooltip note="View">
				<div
					onClick={() => {
						let { proxyURL, url, width, height } = thumbnail;
						width = width > 650 ? 650 : width;
						height = height > 650 ? 650 : height;
						openModal(<div className="spotify-banner-modal">{getImageModalComponent(proxyURL || url, { width, height })}</div>);
					}}
					className="spotifyEmbed-thumbnail"
				/>
			</Tooltip>
			<h2 className="spotifyEmbed-title">{rawTitle}</h2>
			<p className="spotifyEmbed-description">{rawDescription}</p>

			{type && id && (
				<div className="spotifyEmbed-controls">
					{!isThis && isActive && [listenBtn, queueBtn]}
					<Tooltip note="Copy link">
						<div
							onClick={() => Store.Utils.copySpotifyLink(url)}
							className="spotifyEmbed-btn spotifyEmbed-btn-copy">
							<CopyIcon />
						</div>
					</Tooltip>
				</div>
			)}
			<Tooltip note="Play on Spotify">
				<div
					onClick={() => Store.Utils.openSpotifyLink(url)}
					className="spotifyEmbed-spotifyIcon">
					<SpotifyIcon />
				</div>
			</Tooltip>
		</div>
	);
};

import "./styles";
import { React } from "@Api";
import Tooltip from "@Components/Tooltip";
import AddToQueueIcon from "@Components/icons/AddToQueueIcon";
import CopyIcon from "@Components/icons/CopyIcon";
import ListenIcon from "@Components/icons/ListenIcon";
import SpotifyIcon from "@Components/icons/SpotifyIcon";
import ImageIcon from "@Components/icons/ImageIcon";
import { getImageModalComponent, openModal, shallow } from "@Utils";
import Settings from "@Utils/Settings";

import { Store } from "../../Store";
import AccessibilityStore from "@Stores/AccessibilityStore";
import useStateFromStores from "@Modules/useStateFromStores";
import TrackTimeLine from "../TrackTimeLine";

export default ({ id, type, embed: { thumbnail, rawTitle, rawDescription, url } }) => {
	const embedBannerBackground = Settings(Settings.selectors.embedBannerBackground);
	const useReducedMotion = useStateFromStores([AccessibilityStore], () => AccessibilityStore.useReducedMotion);

	const [isPlaying, isActive] = Store(_ => [_.isPlaying, _.isActive], shallow);
	const mediaId = Store(Store.selectors.mediaId, (n, o) => n === o || (n !== id && o !== id));

	const isThis = mediaId === id;

	const listenBtn = type !== "show" && (
		<Tooltip note={`Play ${type}`}>
			<div
				onClick={() => Store.Api.listen(type, id, rawTitle)}
				className="spotify-embed-btn spotify-embed-btn-listen">
				<ListenIcon />
			</div>
		</Tooltip>
	);

	const queueBtn = (type === "track" || type === "episode") && (
		<Tooltip note={`Add ${type} to queue`}>
			<div
				onClick={() => Store.Api.queue(type, id, rawTitle)}
				className="spotify-embed-btn spotify-embed-btn-addToQueue">
				<AddToQueueIcon />
			</div>
		</Tooltip>
	);

	let className = "spotify-embed-container";
	if (isThis && isPlaying && !useReducedMotion) className += " playing";
	if (embedBannerBackground) className += " bannerBackground";

	const banner = thumbnail?.proxyURL || thumbnail?.url ;

	return (
		<div
			className={className}
			style={{ "--thumbnail": `url(${banner})` }}>
			<Tooltip note="View">
				<div
					onClick={() => {
						let { width, height } = thumbnail;
						width = width > 650 ? 650 : width;
						height = height > 650 ? 650 : height;
						openModal(<div className="spotify-banner-modal">{getImageModalComponent(banner, { width, height })}</div>);
					}}
					className="spotify-embed-thumbnail"
				/>
			</Tooltip>
			<h2 className="spotify-embed-title">{rawTitle}</h2>
			<p className="spotify-embed-description">{rawDescription}</p>

			{type && id && (
				<div className="spotify-embed-controls">
					
					{(isThis && isActive && !isPlaying || !isThis && isActive) && [listenBtn, queueBtn]}
					{isThis && isActive && isPlaying && <TrackTimeLine />}
					<Tooltip note="Copy link">
						<div
							onClick={() => Store.Utils.copySpotifyLink(url)}
							className="spotify-embed-btn spotify-embed-btn-copy">
							<CopyIcon />
						</div>
					</Tooltip>
					<Tooltip note="Copy banner">
						<div
							onClick={() => Store.Utils.copySpotifyLink(banner)}
							className="spotify-embed-btn spotify-embed-btn-copy">
							<ImageIcon />
						</div>
					</Tooltip>
				</div>
			)}
			<Tooltip note="Play on Spotify">
				<div
					onClick={() => Store.Utils.openSpotifyLink(url)}
					className="spotify-embed-spotifyIcon">
					<SpotifyIcon />
				</div>
			</Tooltip>
		</div>
	);
};

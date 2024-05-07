import { React } from "@Api";
import Tooltip from "@Components/Tooltip";
import AddToQueueIcon from "@Components/icons/AddToQueueIcon";
import CopyIcon from "@Components/icons/CopyIcon";
import ListenIcon from "@Components/icons/ListenIcon";
import SpotifyIcon from "@Components/icons/SpotifyIcon";
import ImageIcon from "@Components/icons/ImageIcon";
import { getImageModalComponent, openModal, shallow } from "@Utils";
import Settings from "@Utils/Settings";
import SpotifyApi from "../SpotifyAPIWrapper";
import { Store } from "../Store";
import AccessibilityStore from "@Stores/AccessibilityStore";
import FluxHelpers from "@Modules/FluxHelpers";
import TrackTimeLine from "./TrackTimeLine";

export default ({ id, type, embed: { thumbnail, rawTitle, rawDescription, url } }) => {
	const embedBannerBackground = Settings(Settings.selectors.embedBannerBackground);
	const useReducedMotion = FluxHelpers.useStateFromStores([AccessibilityStore], () => AccessibilityStore.useReducedMotion);

	const [isPlaying, isActive] = Store(_ => [_.isPlaying, _.isActive], shallow);
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

	let className = "spotifyEmbed-container";
	if (isThis && isPlaying && !useReducedMotion) className += " playing";
	if (embedBannerBackground) className += " bannerBackground";

	const banner = thumbnail?.url || thumbnail?.proxyURL ;

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
					className="spotifyEmbed-thumbnail"
				/>
			</Tooltip>
			<h2 className="spotifyEmbed-title">{rawTitle}</h2>
			<p className="spotifyEmbed-description">{rawDescription}</p>

			{type && id && (
				<div className="spotifyEmbed-controls">
					
					{(isThis && isActive && !isPlaying || !isThis && isActive) && [listenBtn, queueBtn]}
					{isThis && isActive && isPlaying && <TrackTimeLine />}
					<Tooltip note="Copy link">
						<div
							onClick={() => Store.Utils.copySpotifyLink(url)}
							className="spotifyEmbed-btn spotifyEmbed-btn-copy">
							<CopyIcon />
						</div>
					</Tooltip>
					<Tooltip note="Copy banner">
						<div
							onClick={() => Store.Utils.copySpotifyLink(banner)}
							className="spotifyEmbed-btn spotifyEmbed-btn-copy">
							<ImageIcon />
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

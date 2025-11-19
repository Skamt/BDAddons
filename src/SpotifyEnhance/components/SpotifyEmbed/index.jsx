import "./styles";
import React from "@React";
import Tooltip from "@Components/Tooltip";
import { AddToQueueIcon, CopyIcon, ImageIcon, ListenIcon, SpotifyIcon } from "@Components/Icon";
import useStateFromStores from "@Modules/useStateFromStores";
import AccessibilityStore from "@Stores/AccessibilityStore";
import { fit, shallow } from "@Utils";
import { ImageComponent } from "@Utils/ImageModal";
import { openModal } from "@Utils/Modals";
import Settings from "@Utils/Settings";
import { Store } from "@/Store";
import PreviewPlayer from "./PreviewPlayer";
import TrackTimeLine from "../TrackTimeLine";

function useGetRessource(type, id) {
	const [state, setState] = React.useState(null);
	React.useEffect(() => {
		(async () => {
			const data = await Store.Api.getRessource(type, id);
			if (data) setState(data);
		})();
	}, []);
	return state;
}

export default ({ id, type }) => {
	const data = useGetRessource(type, id);
	const { thumbnail, rawTitle, rawDescription, url, preview_url } = data || {};
	const embedBannerBackground = Settings(Settings.selectors.embedBannerBackground);
	const useReducedMotion = useStateFromStores([AccessibilityStore], () => AccessibilityStore.useReducedMotion);

	const [isPlaying, isActive] = Store(_ => [_.isPlaying, _.isActive], shallow);
	const mediaId = Store(Store.selectors.mediaId, (n, o) => n === o || (n !== id && o !== id));

	const isThis = mediaId === id;

	const listenBtn = type !== "show" && (
		<Tooltip note={`Play ${type}`}>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<div
				onClick={() => Store.Api.listen(type, id, rawTitle)}
				className="spotify-embed-btn spotify-embed-btn-listen">
				<ListenIcon />
			</div>
		</Tooltip>
	);

	const queueBtn = (type === "track" || type === "episode") && (
		<Tooltip note={`Add ${type} to queue`}>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
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

	const banner = {
		bannerSm: thumbnail?.[2],
		bannerMd: thumbnail?.[1],
		bannerLg: thumbnail?.[0]
	};

	const bannerStyleObj = {};
	if (banner.bannerSm) bannerStyleObj["--banner-sm"] = `url(${banner.bannerSm?.url})`;
	if (banner.bannerMd) bannerStyleObj["--banner-md"] = `url(${banner.bannerMd?.url})`;
	if (banner.bannerLg) bannerStyleObj["--banner-lg"] = `url(${banner.bannerLg?.url})`;

	return (
		<div
			className={className}
			style={bannerStyleObj}>
			<Tooltip note="View">
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
				<div
					onClick={() => {
						const { url, ...rest } = banner.bannerLg;
						openModal(
							<div className="spotify-banner-modal">
								<ImageComponent
									url={url}
									{...fit(rest)}
								/>
							</div>
						);
					}}
					className="spotify-embed-thumbnail"
				/>
			</Tooltip>
			<Tooltip note={rawTitle}>
				<h2 className="spotify-embed-title">{rawTitle}</h2>
			</Tooltip>
			<Tooltip note={rawDescription}>
				<p className="spotify-embed-description">{rawDescription}</p>
			</Tooltip>

			{type && id && (
				<div className="spotify-embed-controls">
					{((isThis && isActive && !isPlaying) || (!isThis && isActive)) && [listenBtn, queueBtn]}
					{isThis && isActive && isPlaying && <TrackTimeLine />}
					<Tooltip note="Copy link">
						{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
						<div
							onClick={() => Store.Utils.copySpotifyLink(url)}
							className="spotify-embed-btn spotify-embed-btn-copy">
							<CopyIcon />
						</div>
					</Tooltip>
					<Tooltip note="Copy banner">
						{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
						<div
							onClick={() => Store.Utils.copySpotifyLink(banner.bannerLg?.url)}
							className="spotify-embed-btn spotify-embed-btn-copy">
							<ImageIcon />
						</div>
					</Tooltip>
					{preview_url && <PreviewPlayer src={preview_url} />}
				</div>
			)}
			<Tooltip note="Play on Spotify">
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
				<div
					onClick={() => Store.Utils.openSpotifyLink(url)}
					className="spotify-embed-spotifyIcon">
					<SpotifyIcon />
				</div>
			</Tooltip>
		</div>
	);
};

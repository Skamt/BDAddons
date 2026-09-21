import "./styles";
import React from "@React";
import Tooltip from "@Components/Tooltip";
import { AddToQueueIcon, CopyIcon, ImageIcon, ListenIcon, SpotifyIcon } from "@Components/Icon";
import useStateFromStores from "@Modules/useStateFromStores";
import AccessibilityStore from "@Stores/AccessibilityStore";
import { fit, shallow } from "@Utils";
import { ImageComponent } from "@Utils/ImageModal";
import { openModal } from "@Utils/Modals";
import { spotifyCopy, copySpotifyUrl, openSpotifyUrl, useGetRessource } from "@/utils";
import Settings from "@Utils/Settings";
import Store from "@/store";
import PreviewPlayer from "./PreviewPlayer";
import TrackTimeLine from "../TrackTimeLine";
import { classNameFactory } from "@Utils/css";
const c = classNameFactory("spotify-embed");

import ControlButton from "../ControlButton";


export default ({ id, type }) => {
	const data = useGetRessource(type, id);
	const { thumbnail, rawTitle, rawDescription, url, preview_url } = data || {};
	const embedBannerBackground = Settings(Settings.selectors.embedBannerBackground);
	const useReducedMotion = useStateFromStores(
		[AccessibilityStore],
		() => AccessibilityStore.useReducedMotion,
	);

	const [isPlaying, isActive] = Store((_) => [_.isPlaying, _.isActive], shallow);
	const mediaId = Store(Store.selectors.mediaId, (n, o) => n === o || (n !== id && o !== id));

	const isThis = mediaId === id;

	const listenBtn = type !== "show" && (
		<ControlButton
			tooltip={`Play ${type}`}
			onClick={() => Store.Api.listen(type, id, rawTitle)}
			className={c("btn", "btn-listen")}
			value={<ListenIcon />}
		/>
	);

	const queueBtn = (type === "track" || type === "episode") && (
		<ControlButton
			tooltip={`Add ${type} to queue`}
			onClick={() => Store.Api.queue(type, id, rawTitle)}
			className={c("btn", "btn-addToQueue")}
			value={<AddToQueueIcon />}
		/>
	);

	let className = "spotify-embed-container";
	if (isThis && isPlaying && !useReducedMotion) className += " playing";
	if (embedBannerBackground) className += " bannerBackground";

	const banner = {
		bannerSm: thumbnail?.[2],
		bannerMd: thumbnail?.[1],
		bannerLg: thumbnail?.[0],
	};

	const bannerStyleObj = {};
	if (banner.bannerSm) bannerStyleObj["--banner-sm"] = `url(${banner.bannerSm?.url})`;
	if (banner.bannerMd) bannerStyleObj["--banner-md"] = `url(${banner.bannerMd?.url})`;
	if (banner.bannerLg) bannerStyleObj["--banner-lg"] = `url(${banner.bannerLg?.url})`;

	return (
		<div className={className} style={bannerStyleObj}>
			<Tooltip note="View">
				<div
					onClick={() => {
						const { url, ...rest } = banner.bannerLg;
						openModal(
							<div className="spotify-banner-modal">
								<ImageComponent url={url} {...fit(rest)} />
							</div>,
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

					<ControlButton
						tooltip="Copy link"
						onClick={() => copySpotifyUrl(url)}
						className={c("btn", "btn-copy-url")}
						value={<CopyIcon />}
					/>

					<ControlButton
						tooltip="Copy banner"
						onClick={() => spotifyCopy(banner.bannerLg?.url)}
						className={c("btn", "btn-copy-banner")}
						value={<ImageIcon />}
					/>

					{preview_url && <PreviewPlayer src={preview_url} />}
				</div>
			)}

			<ControlButton
				tooltip="Play on Spotify"
				onClick={() => openSpotifyUrl(url)}
				className={c("spotifyIcon")}
				value={<SpotifyIcon />}
			/>
		</div>
	);
};


export {default as SpotifyEmbedControls} from "./SpotifyEmbedControls";
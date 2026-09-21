import "./styles";
import React from "@React";
import ControlButton from "../ControlButton";
import Store from "@/store";
import { AddToQueueIcon, SpotifyIcon, CopyIcon, ImageIcon, ListenIcon } from "@Components/Icon";
import { copySpotifyUrl, spotifyCopy, openSpotifyUrl, useGetRessource } from "@/utils";
import PreviewPlayer from "./PreviewPlayer";


import FieldSet from "@Components/FieldSet";
export default ({ id, type, embed: { thumbnail, rawTitle, url } }) => {
	const isActive = Store(Store.selectors.isActive);
	const { preview_url } = useGetRessource(type, id) || {};

	const listenBtn = type !== "show" && (
		<ControlButton
			tooltip={`Play ${type}`}
			className="spotify-embed-btn"
			onClick={() => Store.Api.listen(type, id, rawTitle)}
			disabled={!isActive}
			value={<ListenIcon />}
		/>
	);

	const queueBtn = (type === "track" || type === "episode") && (
		<ControlButton
			tooltip={`Add ${type} to queue`}
			className="spotify-embed-btn"
			disabled={!isActive}
			value={<AddToQueueIcon />}
			onClick={() => Store.Api.queue(type, id, rawTitle)}
		/>
	);

	return (
		<FieldSet gap={5} direction={FieldSet.direction.HORIZONTAL}>
			{listenBtn}
			{queueBtn}
			<ControlButton
				tooltip="Copy link"
				className="spotify-embed-btn"
				value={<CopyIcon />}
				onClick={() => copySpotifyUrl(url)}
			/>
			<ControlButton
				tooltip="Copy banner"
				className="spotify-embed-btn"
				value={<ImageIcon />}
				onClick={() => spotifyCopy(thumbnail?.url || thumbnail?.proxyURL)}
			/>
			{preview_url && <PreviewPlayer src={preview_url} />}
			<ControlButton
				tooltip="Play on Spotify"
				onClick={() => openSpotifyUrl(url)}
				className="spotify-embed-btn"
				value={<SpotifyIcon />}
			/>
		</FieldSet>
	);
};

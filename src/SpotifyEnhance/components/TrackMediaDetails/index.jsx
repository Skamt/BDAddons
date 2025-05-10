import "./styles";
import React from "@React";
import Tooltip from "@Components/Tooltip";
import Anchor from "@Modules/Anchor";

import { Store } from "../../Store";
import ContextMenu from "@Components/ContextMenu";
import Artist from "./Artist";
import TrackBanner from "./TrackBanner";

import ListenIcon from "@Components/icons/ListenIcon";
import ExternalLinkIcon from "@Components/icons/ExternalLinkIcon";

export default ({ name, artists, mediaType }) => {
	if (mediaType !== "track") {
		return (
			<div className="spotify-player-media">
				<div className="spotify-player-title">Playing {mediaType || "Unknown"}</div>
			</div>
		);
	}

	const songUrl = Store.state.getSongUrl();
	const { name: albumName, url: albumUrl, id: albumeId } = Store.state.getAlbum();

	return (
		<div className="spotify-player-media">
			<TrackBanner />
			<Tooltip note={name}>
				<Anchor
					href={songUrl}
					className="spotify-player-title ellipsis">
					{name}
				</Anchor>
			</Tooltip>
			<Artist artists={artists} />
			<ContextMenu
				menuItems={[
					{
						className: "spotify-menuitem",
						id: "open-link",
						action: () => Store.Utils.openSpotifyLink(albumUrl),
						icon: ExternalLinkIcon,
						label: "Open externally"
					},
					{
						className: "spotify-menuitem",
						id: "album-play",
						action: () => Store.Api.listen("album", albumeId, albumName),
						icon: ListenIcon,
						label: "Play Album"
					}
				]}
				className="spotify-player-album">
				<div>
					on<span className="ellipsis">{albumName}</span>
				</div>
			</ContextMenu>
		</div>
	);
};



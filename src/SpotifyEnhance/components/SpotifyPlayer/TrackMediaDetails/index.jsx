import "./styles";
import React from "@React";
import Tooltip from "@Components/Tooltip";
import { Anchor } from "@Discord/Modules";
import Store from "@/store";
import Artist from "./Artist";
import TrackBanner from "./TrackBanner";
import { ContextMenu } from "@Api";
import Popout from "@Components/Popout";
import { ListenIcon, ExternalLinkIcon } from "@Components/Icon";
import { openSpotifyUrl } from "@/utils";

export default ({ name, artists, mediaType }) => {
	if (mediaType !== "track") {
		return (
			<div className="spotify-player-media">
				<div className="spotify-player-title">Playing {mediaType || "Unknown"}</div>
			</div>
		);
	}

	const songUrl = Store.getSongUrl();
	const { name: albumName, url: albumUrl, id: albumeId } = Store.getAlbum();

	return (
		<div className="spotify-player-media">
			<TrackBanner />
			<Tooltip note={name}>
				<Anchor href={songUrl} className="spotify-player-title ellipsis">
					{name}
				</Anchor>
			</Tooltip>
			<Artist artists={artists} />

			<Popout
				renderPopout={(e) => (
					<ContextMenu.Menu onClose={e.closePopout}>
						{ContextMenu.buildMenuChildren([
							{
								className: "spotify-menuitem",
								id: "open-link",
								action: () => openSpotifyUrl(albumUrl),
								leadingAccessory: { type: "icon", icon: ExternalLinkIcon },
								label: "Open externally",
							},
							{
								className: "spotify-menuitem",
								id: "album-play",
								action: () => Store.Api.listen("album", albumeId, albumName),
								leadingAccessory: { type: "icon", icon: ListenIcon },
								label: "Play Album",
							},
						])}
					</ContextMenu.Menu>
				)}
			>
				{(e) => (
				
						<div onClick={e.onClick} className="outline pointer spotify-player-album ellipsis">{`on ${albumName}`}</div>
					
				)}
			</Popout>
		</div>
	);
};

import "./styles";
import React from "@React";
import { ContextMenu } from "@Api";
import HoverPopout from "@Components/HoverPopout";
import ListenIcon from "@Components/icons/ListenIcon";
import ExternalLinkIcon from "@Components/icons/ExternalLinkIcon";
import { Store } from "@/Store";

export default function Artist({ artists }) {
	const menu =
		artists.length === 1
			? getArtistContextMenu(artists[0])
			: artists.map(artist => ({
					type: "submenu",
					id: artist.id,
					label: artist.name,
					items: getArtistContextMenu(artist)
				}));

	return (
		<HoverPopout popout={e => <ContextMenu.Menu onClose={e.closePopout}>{ContextMenu.buildMenuChildren(menu)}</ContextMenu.Menu>}>
			<div className="spotify-player-artist ellipsis">{`on ${artists[0].name}`}</div>
		</HoverPopout>
	);
}

function getArtistContextMenu(artist) {
	return [
		{
			className: "spotify-menuitem",
			id: "open-link",
			action: () => Store.Utils.openSpotifyLink(`https://open.spotify.com/artist/${artist.id}`),
			icon: ExternalLinkIcon,
			label: "Open externally"
		},
		{
			className: "spotify-menuitem",
			id: "artist-play",
			action: () => Store.Api.listen("artist", artist.id, artist.name),
			icon: ListenIcon,
			label: "Play Artist"
		}
	];
}

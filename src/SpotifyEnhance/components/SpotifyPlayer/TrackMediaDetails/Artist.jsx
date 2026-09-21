import "./styles";
import React from "@React";
import { ContextMenu } from "@Api";
import Popout from "@Components/Popout";
import Store from "@/store";
import { ListenIcon, ExternalLinkIcon } from "@Components/Icon";
import { openSpotifyUrl } from "@/utils";
import Tooltip from "@Components/Tooltip";

export default function Artist({ artists }) {
	const menu =
		artists.length === 1
			? getArtistContextMenu(artists[0])
			: artists.map((artist) => ({
					type: "submenu",
					id: artist.id,
					label: artist.name,
					items: getArtistContextMenu(artist),
				}));

	return (
		<Popout
			renderPopout={(e) => (
				<ContextMenu.Menu onClose={e.closePopout}>
					{ContextMenu.buildMenuChildren(menu)}
				</ContextMenu.Menu>
			)}
		>
			{(e) => (
				<div
					onClick={e.onClick}
					className="outline pointer spotify-player-artist ellipsis"
				>{`by ${artists[0].name}`}</div>
			)}
		</Popout>
	);
}

function getArtistContextMenu(artist) {
	return [
		{
			className: "spotify-menuitem",
			id: "open-link",
			action: () => openSpotifyUrl(`https://open.spotify.com/artist/${artist.id}`),
			leadingAccessory: { type: "icon", icon: ExternalLinkIcon },
			label: "Open externally",
		},
		{
			className: "spotify-menuitem",
			id: "artist-play",
			action: () => Store.Api.listen("artist", artist.id, artist.name),
			leadingAccessory: { type: "icon", icon: ListenIcon },
			label: "Play Artist",
		},
	];
}

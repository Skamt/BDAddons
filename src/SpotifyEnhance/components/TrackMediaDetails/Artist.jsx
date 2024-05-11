import { React } from "@Api";
import ContextMenu from "@Components/ContextMenu";
import ListenIcon from "@Components/icons/ListenIcon";
import ExternalLinkIcon from "@Components/icons/ExternalLinkIcon";
import { Store } from "../../Store";

export default function Artist({ artists }) {
	return (
		<ContextMenu
			menuItems={
				artists.length > 1
					? artists.map(artist => {
							return {
								id: artist.id,
								label: artist.name,
								children: getArtistContextMenu(artist)
							};
						})
					: getArtistContextMenu(artists[0])
			}
			className="spotify-player-artist">
			<div>
				by<span className="ellipsis">{artists[0].name}</span>
			</div>
		</ContextMenu>
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

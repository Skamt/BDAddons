import { React } from "@Api";
import Tooltip from "@Components/Tooltip";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import { getImageModalComponent, openModal } from "@Utils";
import Toast from "@Utils/Toast";
import { Store } from "../Store";
import ContextMenu from "@Components/ContextMenu";
import VolumeIcon from "@Components/icons/VolumeIcon";
import SpotifyApi from "../SpotifyAPIWrapper";

const { Anchor } = TheBigBoyBundle;

export default ({ name, artists, mediaType }) => {
	if (mediaType !== "track") {
		return (
			<div className="spotify-player-media">
				<div className="spotify-player-title">Playing {mediaType || "Unknown"}</div>
			</div>
		);
	}

	const songUrl = Store.state.getSongUrl();
	const { bannerSm, bannerLg } = Store.state.getSongBanners();
	const { name: albumName, url: albumUrl, id: albumeId } = Store.state.getAlbum();

	return (
		<div className="spotify-player-media">
			<TrackBanner
				bannerSm={bannerSm}
				bannerLg={bannerLg}
			/>
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
						icon: VolumeIcon,
						label: "Open externally"
					},
					{
						className: "spotify-menuitem",
						id: "album-play",
						action: () => SpotifyApi.listen("album", albumeId, albumName),
						icon: VolumeIcon,
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

function Artist({ artists }) {
	return (
		<ContextMenu
			menuItems={artists.map(artist => {
				return {
					id: artist.id,
					label: artist.name,
					children: [
						{
							className: "spotify-menuitem",
							id: "open-link",
							action: () => Store.Utils.openSpotifyLink(`https://open.spotify.com/artist/${artist.id}`),
							icon: VolumeIcon,
							label: "Open externally"
						},
						{
							className: "spotify-menuitem",
							id: "artist-play",
							action: () => SpotifyApi.listen("artist", artist.id, artist.name),
							icon: VolumeIcon,
							label: "Play Artist"
						}
					]
				};
			})}
			className="spotify-player-artist">
			<div>
				by<span className="ellipsis">{artists[0].name}</span>
			</div>
		</ContextMenu>
	);
}

function TrackBanner({ bannerLg }) {
	const thumbnailClickHandler = () => {
		if (!bannerLg.url) return Toast.error("Could not open banner");
		const { url, ...rest } = bannerLg;
		openModal(<div className="spotify-banner-modal">{getImageModalComponent(url, rest)}</div>);
	};

	return (
		<Tooltip note="View">
			<div
				onClick={thumbnailClickHandler}
				className="spotify-player-banner"
			/>
		</Tooltip>
	);
}

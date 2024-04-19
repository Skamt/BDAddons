import { React } from "@Api";
import Popout from "@Components/Popout";
import { getImageModalComponent, openModal } from "@Utils";
import Toast from "@Utils/Toast";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import Tooltip from "@Components/Tooltip";
const { Anchor } = TheBigBoyBundle;

export default ({ media, mediaType }) => {
	if (mediaType !== "track" || !media) {
		return (
			<div className="spotify-player-media">
				<div className="spotify-player-title">Playing {mediaType || "Unknown"}</div>
			</div>
		);
	}

	const albumName = media.album.name;
	const albumUrl = media.album.external_urls.spotify;
	const url = media.external_urls.spotify;
	const name = media.name;
	const artists = media.artists;

	const { bannerSm, bannerLg } = {
		bannerSm: media.album.images[2],
		bannerLg: media.album.images[0]
	};

	return (
		<div className="spotify-player-media">
			<TrackBanner
				bannerSm={bannerSm}
				bannerLg={bannerLg}
			/>
			<Tooltip note={name}>
				<Anchor
					href={url}
					className="spotify-player-title">
					{name}
				</Anchor>
			</Tooltip>
			<Artist artists={artists} />
			<Tooltip note={albumName}>
				<div className="spotify-player-album">
					on <Anchor href={albumUrl}>{albumName}</Anchor>
				</div>
			</Tooltip>
		</div>
	);
};

function transformArtist(artist) {
	return (
		<Anchor
			className="spotify-player-artist-link"
			href={`https://open.spotify.com/artist/${artist.id}`}>
			{artist.name}
		</Anchor>
	);
}

function Artist({ artists }) {
	const first = <div className="spotify-player-artist">by {transformArtist(artists[0])}</div>;

	if (artists.length === 1) return first;
	return (
		<Popout
			renderPopout={() => <div className="spotify-player-artists-popout"> {artists.map(transformArtist)}</div>}
			position="top"
			align="center"
			animation="1"
			className="spotify-player-multiple-artists"
			spacing={0}>
			{first}
		</Popout>
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

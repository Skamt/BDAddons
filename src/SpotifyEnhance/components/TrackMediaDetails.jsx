import { React } from "@Api";

import { getImageModalComponent, openModal } from "@Utils";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

const { Anchor } = TheBigBoyBundle;

export default ({ playerState }) => {
	const { trackAlbumName, trackAlbumUrl, trackBannerObj, trackUrl, trackName, trackArtists } = playerState;
	const bannerPlaceholder = {
		url: undefined,
		height: undefined,
		width: undefined
	};
	return (
		<div className="spotify-player-media">
			<TrackBanner banner={trackBannerObj || [placeholder, , placeholder]} />
			{trackUrl ? (
				<Anchor
					href={trackUrl}
					className="spotify-player-title">
					{trackName}
				</Anchor>
			) : (
				"Unkown title"
			)}
			<Artist artists={trackArtists} />
			<div className="spotify-player-album">on {trackAlbumUrl ? <Anchor href={trackAlbumUrl}>{trackAlbumName}</Anchor> : "Unkown album"}</div>
		</div>
	);
};

function Artist({ artists }) {
	if (!artists) return <div className="spotify-player-artist">by Unkown artist</div>;

	function transform(artist) {
		return <Anchor href={artist.external_urls.spotify}>{artist.name}</Anchor>;
	}
	const artist =
		artists?.length === 1
			? transform(artists[0])
			: artists.map(transform).reduce((acc, el, index, obj) => {
					acc.push(el);
					if (index < obj.length - 1) acc.push(",");
					return acc;
			  }, []);

	return <div className="spotify-player-artist">by {artist}</div>;
}

function TrackBanner({ banner }) {
	const [{ height, width, url }, , { url: playerThumbnail }] = banner;

	const thumbnailClickHandler = () => {
		if (url) openModal(getImageModalComponent(url, { height, width }));
	};

	return (
		<div
			onClick={thumbnailClickHandler}
			style={{ "--banner": `url(${playerThumbnail})` }}
			className="spotify-player-banner"></div>
	);
}

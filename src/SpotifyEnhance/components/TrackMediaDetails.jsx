import { React } from "@Api";

import { getImageModalComponent, openModal } from "@Utils";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

const { Anchor } = TheBigBoyBundle;

export default ({ track }) => {
	if (!track) return;

	const { albumName, albumUrl, bannerObj, url, name, artists } = track;

	return (
		<div className="spotify-player-media">
			<TrackBanner banner={bannerObj} />
			<Anchor
				href={url}
				className="spotify-player-title">
				{name}
			</Anchor>

			<Artist artists={artists} />
			<div className="spotify-player-album">
				on <Anchor href={albumUrl}>{albumName}</Anchor>{" "}
			</div>
		</div>
	);
};

function transformArtist(artist) {
	return <Anchor href={`https://open.spotify.com/artist/${artist.id}`}>{artist.name}</Anchor>;
}

function Artist({ artists }) {
	const artist =
		artists?.length === 1
			? transformArtist(artists[0])
			: artists.map(transformArtist).reduce((acc, el, index, obj) => {
					acc.push(el);
					if (index < obj.length - 1) acc.push(", ");
					return acc;
			  }, []);

	return <div className="spotify-player-artist">by {artist}</div>;
}

function TrackBanner({ banner = [] }) {
	const smBanner = banner[2];

	const thumbnailClickHandler = () => {
		const lgBanner = banner[0];
		if(!lgBanner) return;
		openModal(getImageModalComponent(lgBanner.url, lgBanner));
	};

	return (
		<div
			onClick={thumbnailClickHandler}
			style={{ "--banner": `url(${smBanner && smBanner.url})` }}
			className="spotify-player-banner"></div>
	);
}

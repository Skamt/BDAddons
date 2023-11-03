import { React } from "@Api";

import { getImageModalComponent, openModal } from "@Utils";
import Toast from "@Utils/Toast";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import Tooltip from "@Components/Tooltip";
const { Anchor } = TheBigBoyBundle;

export default ({ track }) => {
	if (!track) return;

	const { albumName, albumUrl, bannerObj, url, name, artists } = track;

	return (
		<div className="spotify-player-media">
			<TrackBanner banner={bannerObj} />
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
					on <Anchor href={albumUrl}>{albumName}</Anchor>{" "}
				</div>
			</Tooltip>
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
		if (!banner[0]) return Toast.error("Could not open banner");
		const { url, ...rest } = banner[0];
		openModal(<div className="spotify-player-banner-modal">{getImageModalComponent(url, rest)}</div>);
	};

	return (
		<Tooltip note="View">
			<div
				onClick={thumbnailClickHandler}
				style={{ "--banner": `url(${smBanner && smBanner.url})` }}
				className="spotify-player-banner"></div>
		</Tooltip>
	);
}

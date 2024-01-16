import { React } from "@Api";
import Popout from "@Components/Popout";
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
	return <Anchor className="spotify-player-artist-link" href={`https://open.spotify.com/artist/${artist.id}`}>{artist.name}</Anchor>;
}

function Artist({ artists }) {
	if (artists.length === 1) return <div className="spotify-player-artist-container">by {transformArtist(artists[0])}</div>;

	return (
		<Popout
			renderPopout={() => <div className="spotify-player-artists"> {artists.map(transformArtist)}</div>}
			position="top"
			align="center"
			animation="1"
			spacing={0}>
			<div className="spotify-player-artist-container"><Anchor>Multiple artists...</Anchor></div>
		</Popout>
	);
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

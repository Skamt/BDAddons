import { React } from "@Api";
import SpotifyPlayerControls from "./SpotifyPlayerControls";
import TrackMediaDetails from "./TrackMediaDetails";
import TrackTimeLine from "./TrackTimeLine";
import Store from "./../Store";

export default React.memo(function SpotifyPlayer() {
	console.log("player rerendered");

	const isActive = Store(Store.selectors.isActive);
	const media = Store(Store.selectors.media);
	const mediaType = Store(Store.selectors.mediaType);

	if (!isActive) return null;
	if (!media) return null;

	const { bannerMd, bannerSm, bannerLg } = {
		bannerSm: media?.album?.images[2],
		bannerMd: media?.album?.images[1],
		bannerLg: media?.album?.images[0]
	};

	return (
		<div
			style={{
				"--banner-sm": `url(${bannerSm?.url})`,
				"--banner-md": `url(${bannerMd?.url})`,
				"--banner-lg": `url(${bannerLg?.url})`
			}}
			className="spotify-player-container">

			<TrackMediaDetails
				mediaType={mediaType}
				media={media}
			/>

			<TrackTimeLine
				mediaType={mediaType}
				media={media}
			/>

			<SpotifyPlayerControls
				banner={bannerLg}
				media={media}
			/>
		</div>
	);
});

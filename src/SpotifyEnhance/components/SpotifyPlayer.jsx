import { React } from "@Api";
import SpotifyPlayerControls from "./SpotifyPlayerControls";
import TrackMediaDetails from "./TrackMediaDetails";
import TrackTimeLine from "./TrackTimeLine";
import Arrow from "@Components/Icons/Arrow";
import { Store } from "../Store";
import Settings from "@Utils/Settings";
import { shallow } from "@Utils";
import Tooltip from "@Components/Tooltip";
import Button from "@Components/Button";

export default React.memo(function SpotifyPlayer() {
	const [player, playerCompactMode, playerBannerBackground] = Settings(_ => [_.player, _.playerCompactMode, _.playerBannerBackground], shallow);
	const [isActive, media, mediaType] = Store(_ => [_.isActive, _.media, _.mediaType], shallow);

	if (!player || !isActive || !mediaType) return;

	const { bannerMd, bannerSm, bannerLg } = Store.state.getSongBanners();

	let className = "spotify-player-container";
	if (playerCompactMode) className += " compact";
	if (playerBannerBackground) className += " bannerBackground";

	return (
		<div
			style={{
				"--banner-sm": `url(${bannerSm?.url})`,
				"--banner-md": `url(${bannerMd?.url})`,
				"--banner-lg": `url(${bannerLg?.url})`
			}}
			className={className}>
			<TrackMediaDetails
				mediaType={mediaType}
				name={media?.name}
				artists={media?.artists}
			/>

			{mediaType === "track" && <TrackTimeLine />}
			<SpotifyPlayerControls />
			<Tooltip note="More info">
				<Button
					size={Button.Sizes.NONE}
					look={Button.Looks.BLANK}
					innerClassName="flexCenterCenter"
					className="spotify-player-more-info">
					<Arrow />
				</Button>
			</Tooltip>
		</div>
	);
});

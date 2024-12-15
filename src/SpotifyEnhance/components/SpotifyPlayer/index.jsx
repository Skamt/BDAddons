import "./styles";
import { React } from "@Api";
import SpotifyPlayerControls from "../SpotifyPlayerControls";
import TrackMediaDetails from "../TrackMediaDetails";
import TrackTimeLine from "../TrackTimeLine";
import { Store } from "../../Store";
import Settings from "@Utils/Settings";
import { shallow } from "@Utils";

import ArrowIcon from "@Components/icons/ArrowIcon";
import Tooltip from "@Components/Tooltip";

export default React.memo(function SpotifyPlayer() {
	const [isActive, media, mediaType] = Store(_ => [_.isActive, _.media, _.mediaType], shallow);
	const [player, playerBannerBackground] = Settings(_ => [_.player, _.playerBannerBackground], shallow);
	const [playerCompactMode, setplayerCompactMode] = Settings.useSetting("playerCompactMode");

	if (!player || !isActive || !mediaType) return;

	const { bannerMd, bannerSm, bannerLg } = Store.state.getSongBanners();

	let className = "spotify-player-container";
	if (playerCompactMode) className += " compact";
	if (playerBannerBackground) className += " bannerBackground";

	const minmaxClickHandler = () => setplayerCompactMode(!playerCompactMode);

	return (
		<div
			className={className}
			style={{
				"--banner-sm": `url(${bannerSm?.url})`,
				"--banner-md": `url(${bannerMd?.url})`,
				"--banner-lg": `url(${bannerLg?.url})`
			}}>
			<TrackMediaDetails
				mediaType={mediaType}
				name={media?.name}
				artists={media?.artists}
			/>

			{mediaType === "track" && <TrackTimeLine />}
			<SpotifyPlayerControls />
			<Tooltip note={playerCompactMode ? "Maximize" : "Minimize"}>
				<div
					onClick={minmaxClickHandler}
					className="spotify-player-minmax">
					<ArrowIcon />
				</div>
			</Tooltip>
		</div>
	);
});

import { React } from "@Api";
import SpotifyWrapper from "../SpotifyWrapper";
import { useSettings } from "@Utils/Hooks";
import TrackMediaDetails from "./TrackMediaDetails";
import SpotifyPlayerControls from "./SpotifyPlayerControls";
import TrackTimeLine from "./TrackTimeLine";


function SpotifyPlayer() {
	const player = useSettings("player");
	const [{ deviceState, playerState }, setState] = React.useState(SpotifyWrapper.getSpotifyState());
	React.useEffect(() => {
		return SpotifyWrapper.on(() => setState(SpotifyWrapper.getSpotifyState()));
	}, []);

	if (!player) return;
	if (!deviceState) return;
	if (!playerState) return;

	const { disallowedActions, track, currentlyPlayingType, shuffle, volume, repeat, isPlaying, progress } = playerState;
	const { duration, url, bannerMd, bannerSm, bannerLg } = track;

	return (
		<div
			style={{
				"--banner-sm": `url(${bannerSm?.url})`,
				"--banner-md": `url(${bannerMd?.url})`,
				"--banner-lg": `url(${bannerLg?.url})`
			}}
			className="spotify-player-container">
			<TrackMediaDetails
				currentlyPlayingType={currentlyPlayingType}
				track={track}
			/>
			<TrackTimeLine
				currentlyPlayingType={currentlyPlayingType}
				duration={duration}
				isPlaying={isPlaying}
				progress={progress}
			/>
			<SpotifyPlayerControls
				disallowedActions={disallowedActions}
				state={{ shuffle, isPlaying, repeat }}
				data={{ banner: bannerLg.url, url, volume }}
			/>
		</div>
	);
}

import SpotifyStore from "./../SpotifyStore";

export default React.memo(function TestPlayer() {
	console.log("player rerendered");
	const isActive = SpotifyStore(a => a.isActive);
	console.log("isActive",isActive);
	if(!isActive) return null;
	return <div style={{color:"#fff"}}>{`${isActive}`}</div>;
});

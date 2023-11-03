import { React } from "@Api";
import SpotifyWrapper from "../SpotifyWrapper";

import TrackMediaDetails from "./TrackMediaDetails";
import SpotifyPlayerControls from "./SpotifyPlayerControls";
import TrackTimeLine from "./TrackTimeLine";

export default React.memo(function SpotifyPlayer() {
	const [{ deviceState, playerState }, setState] = React.useState(SpotifyWrapper.getSpotifyState());
	React.useEffect(() => {
		return SpotifyWrapper.on(() => setState(SpotifyWrapper.getSpotifyState()));
	}, []);

	if (!deviceState) return;
	if (!playerState) return;
	if (!playerState.track) return;

	const { disallowedActions, track, duration, shuffle, volume, repeat, isPlaying, progress } = playerState;
	const { url } = track;
	
	return (
		<div className="spotify-player-container">
			<TrackMediaDetails track={track} />
			<TrackTimeLine {...{ duration, isPlaying, progress }} />
			<SpotifyPlayerControls
				disallowedActions={disallowedActions}
				state={{ shuffle, isPlaying, repeat }}
				data={{ banner: track.bannerObj, url, volume }}
			/>
		</div>
	);
});

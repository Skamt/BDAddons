import { React } from "@Api";
import SpotifyWrapper from "../SpotifyWrapper";

import TrackMediaDetails from "./TrackMediaDetails";
import SpotifyPlayerControls from "./SpotifyPlayerControls";
import TrackTimeLine from "./TrackTimeLine";

export default React.memo(function SpotifyPlayer(props) {
	const [{ deviceState, playerState }, setState] = React.useState(SpotifyWrapper.getSpotifyState());
	React.useEffect(() => {
		return SpotifyWrapper.on(() => setState(SpotifyWrapper.getSpotifyState()));
	}, []);

	if (!deviceState) return;
	if (!playerState) return;


	const { disallowedActions, track, duration, shuffle, volume, trackUrl, repeat, isPlaying, progress } = playerState;

	return (
		<div className="spotify-player-container">
			{playerState.track && <TrackMediaDetails track={track} />}
			<TrackTimeLine {...{ duration, isPlaying, progress }} />
			<SpotifyPlayerControls
				disallowedActions={disallowedActions}
				state={{ shuffle, isPlaying, repeat }}
				data={{ trackUrl, volume }}
			/>
		</div>
	);
});

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

	const { trackDuration, isPlaying, progress } = playerState;

	return (
		<div className="spotify-player-container">
			<TrackMediaDetails playerState={playerState} />
			<TrackTimeLine
				duration={trackDuration}
				isPlaying={isPlaying}
				progress={progress}
			/>
			<SpotifyPlayerControls playerState={playerState} />
		</div>
	);
});

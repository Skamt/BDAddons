import { React } from "@Api";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

import SpotifyApi from "../SpotifyAPIWrapper";
import Store from "./../Store";

function formatMsToTime(ms) {
	const time = new Date(ms);
	return [time.getUTCHours(), String(time.getUTCMinutes()), String(time.getUTCSeconds()).padStart(2, "0")].filter(Boolean).join(":");
}

export default ({ mediaType }) => {
	const isPlaying = Store(Store.selectors.isPlaying);
	const progress = Store(Store.selectors.progress);
	const duration = Store(Store.selectors.duration);

	const [position, setPosition] = React.useState(progress);
	const sliderRef = React.useRef();
	
	React.useEffect(() => {
		if (!sliderRef.current?.state?.active) setPosition(progress);
	}, [progress]);

	React.useEffect(() => {
		if (!isPlaying || progress >= duration) return;
		
		const interval = setInterval(() => {
			if (progress >= duration || sliderRef.current?.state?.active) 
				return clearInterval(interval);
			setPosition(p => p + 1000);
		}, 1000);

		return () => clearInterval(interval);
	}, [progress, isPlaying]);

	const rangeChangeHandler = e => {
		if (!sliderRef.current?.state?.active) return;
		const pos = Math.floor(e);
		setPosition(pos);
		SpotifyApi.seek(pos);
	};

	if (mediaType !== "track")
		return (
			<div className="spotify-player-timeline">
				<div className="spotify-player-timeline-progress">{formatMsToTime(position)}</div>
			</div>
		);
	return (
		<div className="spotify-player-timeline">
			<TheBigBoyBundle.Slider
				className="spotify-player-timeline-trackbar"
				mini={true}
				minValue={0}
				maxValue={duration}
				initialValue={position < 1000 ? 0 : position}
				onValueChange={rangeChangeHandler}
				onValueRender={formatMsToTime}
				ref={sliderRef}
				grabberClassName="spotify-player-timeline-trackbar-grabber"
				barClassName="spotify-player-timeline-trackbar-bar"
			/>
			<div className="spotify-player-timeline-progress">{formatMsToTime(position)}</div>
			<div className="spotify-player-timeline-duration">{formatMsToTime(duration)}</div>
		</div>
	);
};

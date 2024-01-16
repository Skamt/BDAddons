import { React } from "@Api";
import SpotifyWrapper from "../SpotifyWrapper";
import { usePropBasedState } from "@Utils/Hooks";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
const { Slider } = TheBigBoyBundle;




function formatMsToTime(ms) {
	const time = new Date(ms);
	return [time.getUTCHours(), String(time.getUTCMinutes()), String(time.getUTCSeconds()).padStart(2, "0")].filter(Boolean).join(":");
}

export default ({ duration, isPlaying, progress }) => {
	const [position, setPosition] = React.useState(progress);

	const sliderRef = React.useRef();
	const intervalRef = React.useRef();

	React.useEffect(() => {
		if (sliderRef.current?.state?.active) return;
		setPosition(progress);
	}, [progress]);

	React.useEffect(() => {
		if (!isPlaying) return;
		intervalRef.current = setInterval(() => {
			if (sliderRef.current?.state?.active) return;
			if (position >= duration) clearInterval(intervalRef.current);
			setPosition(position + 1000);
		}, 1000);

		return () => clearInterval(intervalRef.current);
	}, [duration, position, isPlaying]);

	const rangeChangeHandler = e => {
		if (!sliderRef.current?.state?.active) return;
		const pos = Math.floor(e);
		clearInterval(intervalRef.current);
		setPosition(pos);
		SpotifyWrapper.Player.seek(pos);
	};

	return (
		<div className="spotify-player-timeline">
			<Slider
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

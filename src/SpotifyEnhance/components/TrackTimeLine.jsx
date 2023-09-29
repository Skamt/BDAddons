import { React } from "@Api";
import SpotifyWrapper from "../SpotifyWrapper";
import { useStateBasedProp } from "@Utils/Hooks";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
const { Slider } = TheBigBoyBundle;

export default ({ duration, isPlaying, progress }) => {
	const [position, setPosition] = useStateBasedProp(progress);
	const sliderRef = React.useRef();

	React.useEffect(() => {
		if (!isPlaying) return;
		const interval = setInterval(() => {
			if (sliderRef.current?.state?.active) return;

			setPosition(p => {
				if (p >= duration) clearInterval(interval);
				return p + 1000;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [isPlaying]);

	const rangeChangeHandler = e => {
		const pos = Math.floor(e);
		if (!sliderRef.current?.state?.active) return;
		setPosition(pos);
		SpotifyWrapper.Player.seek(pos);
		console.log(pos);
	};

	return (
		<div className="spotify-player-timeline">
			<Slider
				className="spotify-player-timeline-trackbar"
				mini={true}
				minValue={0}
				maxValue={duration}
				initialValue={position}
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

function formatMsToTime(ms) {
	const time = new Date(ms);
	return [time.getUTCHours(), String(time.getUTCMinutes()), String(time.getUTCSeconds()).padStart(2, "0")].filter(Boolean).join(":");
}

import { React } from "@Api";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import SpotifyApi from "../SpotifyAPIWrapper";
import { Store } from "../Store";
import { shallow } from "@Utils";

function formatMsToTime(ms) {
	const time = new Date(ms);
	return [time.getUTCHours(), String(time.getUTCMinutes()), String(time.getUTCSeconds()).padStart(2, "0")].filter(Boolean).join(":");
}

export default () => {
	const [position, duration] = Store(_ => [_.position, _.duration], shallow);

	const sliderRef = React.useRef();

	const rangeChangeHandler = e => {
		if (!sliderRef.current?.state?.active) return;
		const pos = Math.floor(e);
		Store.positionInterval.stop();
		Store.state.setPosition(pos);
		SpotifyApi.seek(pos);
	};

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

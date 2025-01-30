import "./styles";
import { React } from "@Api";
import Slider from "@Modules/Slider";
import { Store } from "../../Store";
import { shallow } from "@Utils";

function formatMsToTime(ms) {
	const time = new Date(ms);
	return [time.getUTCHours(), String(time.getUTCMinutes()), String(time.getUTCSeconds()).padStart(2, "0")].filter(Boolean).join(":");
}

export default () => {
	const [position, duration] = Store(_ => [_.position, _.duration], shallow);

	const [localPosition, setLocalPosition] = React.useState(position);

	React.useEffect(() => {
		if (sliderRef.current?.state?.active) return;
		setLocalPosition(position);
	}, [position]);

	const sliderRef = React.useRef();

	const rangeChangeHandler = e => {
		if (!sliderRef.current?.state?.active) return;
		const pos = Math.floor(e);
		Store.positionInterval.stop();
		Store.state.setPosition(pos);
		Store.Api.seek(pos);
	};

	return (
		<div className="spotify-player-timeline">
			<Slider
				className="spotify-player-timeline-trackbar"
				mini={true}
				minValue={0}
				maxValue={duration}
				initialValue={localPosition < 1000 ? 0 : localPosition}
				onValueChange={rangeChangeHandler}
				onValueRender={formatMsToTime}
				ref={sliderRef}
				grabberClassName="spotify-player-timeline-trackbar-grabber"
				barClassName="spotify-player-timeline-trackbar-bar"
			/>
			<div className="spotify-player-timeline-progress">{formatMsToTime(localPosition)}</div>
			<Duration
				duration={duration}
				position={localPosition}
			/>
		</div>
	);
};

function Duration({ duration, position }) {
	const [toggle, setToggle] = React.useState(false);
	const clickHandler = () => setToggle(!toggle);

	return (
		<div
			onClick={clickHandler}
			className="spotify-player-timeline-duration">
			{toggle ? `-${formatMsToTime(duration - position)}` : formatMsToTime(duration)}
		</div>
	);
}

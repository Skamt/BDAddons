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
	const sliderRef = React.useRef();
	React.useEffect(() => {
		if (sliderRef.current?.state?.active) return;
		sliderRef.current?.setState({ value: position < 1000 ? 0 : position });
	}, [position]);

	const rangeChangeHandler = BdApi.Utils.debounce(e => {
		if (sliderRef.current?.state?.active) return;
		const pos = Math.floor(e);
		Store.positionInterval.stop();
		Store.state.setPosition(pos);
		Store.Api.seek(pos);
	},100);

	return (
		<div className="spotify-player-timeline">
			<Slider
				className="spotify-player-timeline-trackbar"
				mini={true}
				minValue={0}
				initialValue={position}
				maxValue={duration}
				onValueChange={rangeChangeHandler}
				onValueRender={formatMsToTime}
				ref={sliderRef}
				grabberClassName="spotify-player-timeline-trackbar-grabber"
				barClassName="spotify-player-timeline-trackbar-bar"
			/>
			<div className="spotify-player-timeline-progress">{formatMsToTime(position)}</div>
			<Duration
				duration={duration}
				position={position}
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

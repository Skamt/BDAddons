import css from "./styles";
import { DOM, React, Patcher } from "@Api";
import Logger from "@Utils/Logger";

import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

// const { closeModal, FormText,Slider } = TheBigBoyBundle;



// function TrackTimeLine({ progress, duration, onSeek }) {
// 	const [position, setPosition] = React.useState(progress);
// 	const sliderRef = React.useRef();

// 	const rangeChangeHandler = e => {
// 		setPosition(e);
// 	};


// 	React.useEffect(() => {
// 		const interval = setInterval(() => {
// 			if(sliderRef.current?.state?.active) return;
// 			setPosition(p => p + 1000);
// 		}, 1000);

// 		return () => clearInterval(interval);
// 	}, []);

// 	return (
// 		<div className="spotify-player-timeline">
// 				<Slider
// 					className="spotify-player-timeline-trackbar"
// 					mini={true}
// 					minValue={0}
// 					maxValue={duration}
// 					initialValue={position}
// 					onValueChange={rangeChangeHandler}
// 					onValueRender={formatMsToTime}
// 					ref={sliderRef}
// 					grabberClassName="spotify-player-timeline-trackbar-grabber"
// 					barClassName="spotify-player-timeline-trackbar-bar"
// 				/>
// 			<div className="spotify-player-timeline-progress">{formatMsToTime(position)}</div>
// 			<div className="spotify-player-timeline-duration">{formatMsToTime(duration)}</div>
// 		</div>
// 	);
// }

// window.id && closeModal(window.id);
// window.id = BdApi.showConfirmationModal("", comp);

export default () => {
	return {
		start() {
			DOM.addStyle(css);
		},
		stop() {
			DOM.removeStyle();
			Patcher.unpatchAll();
		}
	};
};

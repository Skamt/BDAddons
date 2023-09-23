import { React } from "@Api";

function formatSecondToTime(time) {
	return 

	[Math.floor(time / 3600), String(Math.floor(time / 60) % 60), String(Math.floor(time) % 60).padStart(2, "0")].filter(Boolean).join(":");
}

function parseTime(start, end, currentTime) {
	const maxTimeInSeconds = (end - start) / 1000;
	const minTimeInSeconds = Math.max(Math.min((currentTime - start) / 1000, maxTimeInSeconds), 0);
	const percentage = minTimeInSeconds / maxTimeInSeconds;
	const leftTimer = formatSecondToTime(minTimeInSeconds);
	const rightTimer = formatSecondToTime(maxTimeInSeconds);

	return {
		maxTimeInSeconds,
		minTimeInSeconds,
		percentage,
		leftTimer,
		rightTimer
	};
}

export default ({ start, end, onSeek }) => {
	const [currentTime, setCurrentTime] = React.useState(Date.now());

	React.useEffect(() => {
		const int = setInterval(() => {
			const now = Date.now();
			setCurrentTime(now);
		}, 500);
		return () => clearInterval(int);
	}, []);

	const { maxTimeInSeconds, minTimeInSeconds, percentage, leftTimer, rightTimer } = parseTime(start, end, currentTime);

	return (
		<div className="timeBar">
			<TimerProgress
				maxTimeInSeconds={maxTimeInSeconds}
				percentage={percentage}
				onSeek={onSeek}
			/>
			<div className="leftTimer">{leftTimer}</div>
			<div className="rightTimer">{rightTimer}</div>
		</div>
	);
};

function TimerProgress({ maxTimeInSeconds, percentage, onSeek }) {
	const timerProgressRef = React.useRef();
	const [timePreview, setTimePreview] = React.useState(0);
	const [timePreviewPosition, setTimePreviewPosition] = React.useState(0);

	const loaderStyle = {
		width: `${Math.max(Math.min(percentage, 1), 0) * 100}%`
	};

	const mediaPreviewWidthStyle = {
		width: `${Math.max(Math.min(timePreviewPosition, 1), 0) * 100}%`
	};

	const timePreviewBubbleStyle = {
		left: `${timePreviewPosition * 100}%`,
		opacity: timePreview ? 1 : 0
	};

	const mouseMoveHandler = e => {
		const { clientX: x } = e;
		const { left, width } = timerProgressRef.current.getBoundingClientRect();
		const previewPercentage = (x - left) / width;
		const previewTimeInSeconds = previewPercentage * maxTimeInSeconds;
		const formattedTime = formatSecondToTime(previewTimeInSeconds);
		setTimePreview(formattedTime);
		setTimePreviewPosition(previewPercentage);
	};

	const clickHandler = e => {
		const { clientX: x } = e;
		const { left, width } = timerProgressRef.current.getBoundingClientRect();
		const previewPercentage = (x - left) / width;
		const newTimeInSeconds = previewPercentage * maxTimeInSeconds;
		onSeek(newTimeInSeconds * 1000);
	};

	const mouseLeaveHandler = () => {
		setTimePreview(0);
		setTimePreviewPosition(0);
	};
	

	return (
		<div
			className="timerProgressContainer"
			ref={timerProgressRef}
			onClick={clickHandler}
			onMouseMove={mouseMoveHandler}
			onMouseLeave={mouseLeaveHandler}>
			<div className="timerProgress">
				<div
					className="loader"
					style={loaderStyle}>
					<div className="dragGrabber"></div>
				</div>
				<div
					className="mediaPreview"
					style={mediaPreviewWidthStyle}
				/>
				<div
					className="timePreviewBubble"
					style={timePreviewBubbleStyle}>
					{timePreview}
				</div>
			</div>
		</div>
	);
}

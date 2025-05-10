import React from "@React";
import PauseIcon from "@Components/icons/PauseIcon";
import PlayIcon from "@Components/icons/PlayIcon";
import Tooltip from "@Components/Tooltip";
import Toast from "@Utils/Toast";

class audioPlayer {
	constructor(src) {
		this.src = src;
		this.loaded = false;
	}

	init() {
		if (this.loaded || this.failed) return;

		this.audio = new Audio(this.src);
		this.audio.volume = 0.1;
		this.audio.onloadeddata = () => {
			this.loaded = true;
			this.loading = false;
			this.audio.play();
		};
		this.audio.onerror = () => {
			this.failed = true;
			Toast.error("Could not load preview");
		};

		this.audio.onended = () => {
			this.onended?.();
		};
	}

	play() {
		this.init();
		this.play = this.audio.play.bind(this.audio);
	}

	pause() {
		this.audio.pause();
	}

	dispose() {
		if (!this.audio) return;
		this.audio.pause();
		this.audio.onloadeddata = null;
		this.audio.onerror = null;
		this.audio.onended = null;
		this.audio = null;
	}
}

export default class extends React.Component {
	state = {
		isPlaying: false
	};

	constructor() {
		super();
		this.playHandler = this.playHandler.bind(this);
		this.pauseHandler = this.pauseHandler.bind(this);
	}

	componentDidMount() {
		this.audio = new audioPlayer(this.props.src);
		this.audio.onended = this.pauseHandler;
	}

	componentWillUnmount() {
		this.audio.onended = null;
		this.audio.dispose();
		this.audio = null;
	}

	playHandler() {
		this.setState({ isPlaying: true });
		this.audio.play();
	}

	pauseHandler() {
		this.setState({ isPlaying: false });
		this.audio.pause();
	}

	render() {
		const { playPauseTooltip, playPauseHandler, playPauseIcon, playPauseClassName } = {
			true: {
				playPauseTooltip: "Pause preview",
				playPauseClassName: "spotify-embed-btn spotify-embed-preview-pause",
				playPauseHandler: this.pauseHandler,
				playPauseIcon: <PauseIcon />
			},
			false: {
				playPauseTooltip: "Play preview",
				playPauseClassName: "spotify-embed-btn spotify-embed-preview-play",
				playPauseHandler: this.playHandler,
				playPauseIcon: <PlayIcon />
			}
		}[this.state.isPlaying];

		return (
			<Tooltip note={playPauseTooltip}>
				<div
					onClick={playPauseHandler}
					className={playPauseClassName}>
					{playPauseIcon}
				</div>
			</Tooltip>
		);
	}
}

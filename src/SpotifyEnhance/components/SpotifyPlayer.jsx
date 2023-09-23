import { React, debounce } from "@Api";
import Toast from "@Utils/Toast";
import {useStateBasedProp} from "@Utils/Hooks";
import SpotifyWrapper from "../SpotifyWrapper";

import Button from "@Components/Button";
import Tooltip from "@Components/Tooltip";

import ShareIcon from "@Components/ShareIcon";
import PauseIcon from "@Components/PauseIcon";
import PlayIcon from "@Components/PlayIcon";
import RepeatIcon from "@Components/RepeatIcon";
import ShuffleIcon from "@Components/ShuffleIcon";
import CopyIcon from "@Components/CopyIcon";
import NextIcon from "@Components/NextIcon";
import PreviousIcon from "@Components/PreviousIcon";
import RepeatOneIcon from "@Components/RepeatOneIcon";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

const { Slider, Anchor } = TheBigBoyBundle;

function formatMsToTime(ms) {
	const time = new Date(ms);
	return [time.getUTCHours(), String(time.getUTCMinutes()), String(time.getUTCSeconds()).padStart(2, "0")].filter(Boolean).join(":");
}

function SpotifyPlayerButton({ value, onClick, className, enabled, ...rest }) {
	return (
		<Button
			className={`spotify-player-controls-btn ${className} ${enabled ? "enabled" : ""}`}
			size={Button.Sizes.NONE}
			color={Button.Colors.PRIMARY}
			look={Button.Looks.BLANK}
			onClick={onClick}
			{...rest}>
			{value}
		</Button>
	);
}

function useSpotifyState() {
	const [state, setState] = React.useState(SpotifyWrapper.getSpotifyState());
	React.useEffect(() => {
		return SpotifyWrapper.on(() => setState(SpotifyWrapper.getSpotifyState()));
	}, []);

	return [state.deviceState, state.playerState];
}

export default React.memo(function SpotifyPlayer(props) {
	const [deviceState, playerState] = useSpotifyState();
	if (!deviceState) return;

	const seek = ms => SpotifyWrapper.Player.seek(ms);

	return (
		<div className="spotify-player-container">
			<TrackMediaDetails playerState={playerState} />

			<TrackTimeLine
				playerState={playerState}
				onSeek={seek}
			/>
			<SpotifyPlayerControls playerState={playerState} />
		</div>
	);
});

function SpotifyPlayerControls({ playerState }) {
	if (!playerState) return;

	const shuffle = () => SpotifyWrapper.Player.shuffle(!playerState.shuffle);
	const previous = () => SpotifyWrapper.Player.previous();
	const next = () => SpotifyWrapper.Player.next();
	const share = () => SpotifyWrapper.Utils.share(playerState.trackUrl);
	const copy = () => SpotifyWrapper.Utils.copySpotifyLink(playerState.trackUrl);

	return (
		<div className="spotify-player-controls">
			<Tooltip note="Share in current channel">
				<SpotifyPlayerButton
					className="spotify-player-controls-share"
					onClick={share}
					value={<ShareIcon />}
				/>
			</Tooltip>
			<Tooltip note="shuffle">
				<SpotifyPlayerButton
					enabled={playerState.shuffle}
					className="spotify-player-controls-shuffle"
					onClick={shuffle}
					value={<ShuffleIcon />}
				/>
			</Tooltip>
			<Tooltip note="Previous">
				<SpotifyPlayerButton
					className="spotify-player-controls-previous"
					onClick={previous}
					value={<PreviousIcon />}
				/>
			</Tooltip>
			<PlayPauseBtn isPlaying={playerState.isPlaying} />
			<Tooltip note="Next">
				<SpotifyPlayerButton
					className="spotify-player-controls-next"
					onClick={next}
					value={<NextIcon />}
				/>
			</Tooltip>
			<RepeatBtn repeat={playerState.repeat} />
			<Tooltip note="Copy">
				<SpotifyPlayerButton
					className="spotify-player-controls-copy"
					onClick={copy}
					value={<CopyIcon />}
				/>
			</Tooltip>
		</div>
	);
}

function PlayPauseBtn({ isPlaying }) {
	return isPlaying ? (
		<Tooltip note="Pause">
			<SpotifyPlayerButton
				className="spotify-player-controls-pause"
				onClick={() => SpotifyWrapper.Player.pause()}
				value={<PauseIcon />}
			/>
		</Tooltip>
	) : (
		<Tooltip note="Play">
			<SpotifyPlayerButton
				className="spotify-player-controls-play"
				onClick={() => SpotifyWrapper.Player.play()}
				value={<PlayIcon />}
			/>
		</Tooltip>
	);
}

function RepeatBtn({ repeat }) {
	const { tooltip, arg } =
		{
			"off": {
				tooltip: "Repeat",
				arg: "context"
			},
			"context": {
				tooltip: "Repeat track",
				arg: "track"
			},
			"track": {
				tooltip: "Repeat off",
				arg: "off"
			}
		}[repeat] || {};

	return (
		<Tooltip note={tooltip}>
			<SpotifyPlayerButton
				enabled={repeat !== "off"}
				className="spotify-player-controls-repeat"
				onClick={() => SpotifyWrapper.Player.repeat(arg)}
				value={repeat === "track" ? <RepeatOneIcon /> : <RepeatIcon />}
			/>
		</Tooltip>
	);
}

function TrackMediaDetails({ playerState }) {
	if (!playerState?.track) return;

	const { trackAlbumName, trackAlbumUrl, trackBannerObj, trackUrl, trackName, trackArtists } = playerState;

	return (
		<div className="spotify-player-media">
			<TrackBanner banner={trackBannerObj} />

			<Anchor
				href={trackUrl}
				className="spotify-player-title">
				{trackName}
			</Anchor>
			<Artist artists={trackArtists} />
			<div className="spotify-player-album">
				on <Anchor href={trackAlbumUrl}>{trackAlbumName}</Anchor>
			</div>
		</div>
	);
}

function Artist({ artists }) {
	if (!artists) return;
	function transform(artist) {
		return <Anchor href={artist.external_urls.spotify}>{artist.name}</Anchor>;
	}

	const artist =
		artists?.length === 1
			? transform(artists[0])
			: artists.map(transform).reduce((acc, el, index, obj) => {
					acc.push(el);
					if (index < obj.length - 1) acc.push(",");
					return acc;
			  }, []);

	return <div className="spotify-player-artist">by {artist}</div>;
}

function TrackBanner({ banner }) {
	if (!banner) return;
	const [, , { url }] = banner;
	return (
		<div
			style={{ "--banner": `url(${url})` }}
			className="spotify-player-banner"></div>
	);
}

function TrackTimeLine({ playerState, onSeek }) {
	const { trackDuration: duration, isPlaying, progress } = playerState || {};

	const [position, setPosition] = useStateBasedProp(progress);
	const sliderRef = React.useRef();

	React.useEffect(() => {
		if (!isPlaying) return;
		const interval = setInterval(() => {
			if (sliderRef.current?.state?.active) return;
			setPosition(p => p + 1000);
		}, 1000);

		return () => clearInterval(interval);
	}, [isPlaying]);

	const rangeChangeHandler = e => {
		const pos = Math.floor(e);
		if (!sliderRef.current?.state?.active) return;
		setPosition(pos);
		onSeek(pos);
		console.log(pos)
	}

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
}

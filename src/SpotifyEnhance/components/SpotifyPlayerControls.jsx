import { React } from "@Api";
import SpotifyWrapper from "../SpotifyWrapper";

import Button from "@Components/Button";
import Popout from "@Components/Popout";
import ShareIcon from "@Components/icons/ShareIcon";
import PauseIcon from "@Components/icons/PauseIcon";
import PlayIcon from "@Components/icons/PlayIcon";
import RepeatIcon from "@Components/icons/RepeatIcon";
import ShuffleIcon from "@Components/icons/ShuffleIcon";
import CopyIcon from "@Components/icons/CopyIcon";
import NextIcon from "@Components/icons/NextIcon";
import VolumeIcon from "@Components/icons/VolumeIcon";
import MuteVolumeIcon from "@Components/icons/MuteVolumeIcon";
import Tooltip from "@Components/Tooltip";
import PreviousIcon from "@Components/icons/PreviousIcon";
import RepeatOneIcon from "@Components/icons/RepeatOneIcon";

import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

const { MenuItem, Menu } = TheBigBoyBundle;

// {
//   "interrupting_playback": false,
//   "pausing": false,
//   "resuming": false,
//   "seeking": false,
//   "skipping_next": false,
//   "skipping_prev": false,
//   "toggling_repeat_context": false,
//   "toggling_shuffle": false,
//   "toggling_repeat_track": false,
//   "transferring_playback": false
// }

export default ({ disallowedActions, state, data }) => {
	if (!disallowedActions || !state || !data) return;

	const { url, banner, volume } = data;
	const { shuffle, repeat, isPlaying } = state;
	const { toggling_shuffle, toggling_repeat_track, /* pausing, resuming, seeking, */ skipping_next, skipping_prev } = disallowedActions;

	const { repeatTooltip, repeatActive, repeatIcon, repeatArg } = {
		"off": {
			repeatTooltip: "Repeat",
			repeatArg: "context",
			repeatIcon: <RepeatIcon />,
			repeatActive: false
		},
		"context": {
			repeatTooltip: "Repeat track",
			repeatArg: "track",
			repeatIcon: <RepeatIcon />,
			repeatActive: true
		},
		"track": {
			repeatTooltip: "Repeat off",
			repeatArg: "off",
			repeatIcon: <RepeatOneIcon />,
			repeatActive: true
		}
	}[repeat];

	const shuffleHandler = () => SpotifyWrapper.Player.shuffle(!shuffle);
	const previousHandler = () => SpotifyWrapper.Player.previous();
	const nextHandler = () => SpotifyWrapper.Player.next();
	const repeatHandler = () => SpotifyWrapper.Player.repeat(repeatArg);
	const pauseHandler = () => SpotifyWrapper.Player.pause();
	const playHandler = () => SpotifyWrapper.Player.play();

	const shareSongHandler = () => SpotifyWrapper.Utils.share(url);
	const sharePosterHandler = () => SpotifyWrapper.Utils.share(banner);

	const copySongHandler = () => SpotifyWrapper.Utils.copySpotifyLink(url);
	const copyPosterHandler = () => SpotifyWrapper.Utils.copySpotifyLink(banner);

	const { playPauseTooltip, playPauseHandler, playPauseIcon, playPauseClassName } = {
		"true": {
			playPauseTooltip: "Pause",
			playPauseClassName: "spotify-player-controls-pause",
			playPauseHandler: pauseHandler,
			playPauseIcon: <PauseIcon />
		},
		"false": {
			playPauseTooltip: "Play",
			playPauseClassName: "spotify-player-controls-play",
			playPauseHandler: playHandler,
			playPauseIcon: <PlayIcon />
		}
	}[isPlaying];

	return (
		<div className="spotify-player-controls">
			<Popout
				renderPopout={t => (
					<Menu onClose={t.closePopout}>
						<MenuItem
							className="spotify-player-share-menuitem"
							id="copy-song-link"
							key="copy-song-link"
							icon={CopyIcon}
							action={copySongHandler}
							label="Copy song url"
						/>
						<MenuItem
							className="spotify-player-share-menuitem"
							id="copy-poster-link"
							key="copy-poster-link"
							action={copyPosterHandler}
							icon={CopyIcon}
							label="Copy poster url"
						/>
						<MenuItem
							className="spotify-player-share-menuitem"
							id="share-song-link"
							key="share-song-link"
							action={shareSongHandler}
							icon={ShareIcon}
							label="Share song in current channel"
						/>
						<MenuItem
							className="spotify-player-share-menuitem"
							id="share-poster-link"
							key="share-poster-link"
							action={sharePosterHandler}
							icon={ShareIcon}
							label="Share poster in current channel"
						/>
					</Menu>
				)}
				align="left"
				position="top"
				animation="1">
				<SpotifyPlayerButton
					className="spotify-player-controls-share"
					value={<ShareIcon />}
				/>
			</Popout>

			<Tooltip note="shuffle">
				<SpotifyPlayerButton
					active={shuffle}
					className="spotify-player-controls-shuffle"
					disabled={toggling_shuffle}
					onClick={shuffleHandler}
					value={<ShuffleIcon />}
				/>
			</Tooltip>
			<Tooltip note="Previous">
				<SpotifyPlayerButton
					className="spotify-player-controls-previous"
					disabled={skipping_prev}
					onClick={previousHandler}
					value={<PreviousIcon />}
				/>
			</Tooltip>
			<Tooltip note={playPauseTooltip}>
				<SpotifyPlayerButton
					className={playPauseClassName}
					onClick={playPauseHandler}
					value={playPauseIcon}
				/>
			</Tooltip>
			<Tooltip note="Next">
				<SpotifyPlayerButton
					className="spotify-player-controls-next"
					disabled={skipping_next}
					onClick={nextHandler}
					value={<NextIcon />}
				/>
			</Tooltip>
			<Tooltip note={repeatTooltip}>
				<SpotifyPlayerButton
					active={repeatActive}
					className="spotify-player-controls-repeat"
					disabled={toggling_repeat_track}
					onClick={repeatHandler}
					value={repeatIcon}
				/>
			</Tooltip>

			<Volume volume={volume} />
		</div>
	);
};

function SpotifyPlayerButton({ value, onClick, className, active, ...rest }) {
	return (
		<Button
			className={`spotify-player-controls-btn ${className} ${active ? "enabled" : ""}`}
			size={Button.Sizes.NONE}
			color={Button.Colors.PRIMARY}
			look={Button.Looks.BLANK}
			onClick={onClick}
			{...rest}>
			{value}
		</Button>
	);
}

function Volume({ volume }) {
	const volumeRef = React.useRef(volume || 25);
	const [val, setVal] = React.useState(volume);

	React.useEffect(() => {
		if (volume) volumeRef.current = volume;
		setVal(volume);
	}, [volume]);

	const volumeMuteHandler = () => {
		const target = val ? 0 : volumeRef.current;
		SpotifyWrapper.Player.volume(target).then(() => {
			setVal(target);
		});
	};

	const volumeOnChange = e => setVal(Math.round(e.target.value));

	const volumeOnMouseUp = e => {
		const value = Math.round(e.target.value);
		SpotifyWrapper.Player.volume(value).then(() => {
			volumeRef.current = value;
			setVal(value);
		});
	};

	return (
		<Popout
			renderPopout={() => (
				<div className="spotify-player-controls-volume-slider-wrapper">
					<input
						value={val}
						onChange={volumeOnChange}
						onMouseUp={volumeOnMouseUp}
						type="range"
						step="1"
						min="0"
						max="100"
						className="spotify-player-controls-volume-slider"
					/>
				</div>
			)}
			position="top"
			align="center"
			animation="1"
			spacing={8}>
			<SpotifyPlayerButton
				className="spotify-player-controls-volume"
				onClick={volumeMuteHandler}
				value={val ? <VolumeIcon /> : <MuteVolumeIcon />}
			/>
		</Popout>
	);
}

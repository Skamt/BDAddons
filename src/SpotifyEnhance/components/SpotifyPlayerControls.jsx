import { React } from "@Api";
import SpotifyWrapper from "../SpotifyWrapper";

import Button from "@Components/Button";
import ShareIcon from "@Components/ShareIcon";
import PauseIcon from "@Components/PauseIcon";
import PlayIcon from "@Components/PlayIcon";
import RepeatIcon from "@Components/RepeatIcon";
import ShuffleIcon from "@Components/ShuffleIcon";
import CopyIcon from "@Components/CopyIcon";
import NextIcon from "@Components/NextIcon";
import Tooltip from "@Components/Tooltip";
import PreviousIcon from "@Components/PreviousIcon";
import RepeatOneIcon from "@Components/RepeatOneIcon";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

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

	const { trackUrl } = data;
	const { shuffle, repeat, isPlaying } = state;
	const { toggling_shuffle, toggling_repeat_track, pausing, resuming, seeking, skipping_next, skipping_prev } = disallowedActions;

	const { repeatTooltip, repeatActive, repeatIcon, repeatArg } = {
		"off": {
			repeatTooltip: "Repeat",
			repeatArg: "context",
			repeatIcon: <RepeatIcon />,
			repeatActive:false
		},
		"context": {
			repeatTooltip: "Repeat track",
			repeatArg: "track",
			repeatIcon: <RepeatIcon />,
			repeatActive:true
		},
		"track": {
			repeatTooltip: "Repeat off",
			repeatArg: "off",
			repeatIcon: <RepeatOneIcon />,
			repeatActive:true
		}
	}[repeat];

	const shuffleHandler = () => SpotifyWrapper.Player.shuffle(!shuffle);
	const previousHandler = () => SpotifyWrapper.Player.previous();
	const nextHandler = () => SpotifyWrapper.Player.next();
	const shareHandler = () => SpotifyWrapper.Utils.share(trackUrl);
	const copyHandler = () => SpotifyWrapper.Utils.copySpotifyLink(trackUrl);
	const repeatHandler = () => SpotifyWrapper.Player.repeat(repeatArg);
	const pauseHandler = () => SpotifyWrapper.Player.pause();
	const playHandler = () => SpotifyWrapper.Player.play();

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
			<SpotifyPlayerButton
				note="Share in current channel"
				className="spotify-player-controls-share"
				onClick={shareHandler}
				value={<ShareIcon />}
			/>
			<SpotifyPlayerButton
				note="shuffle"
				active={shuffle}
				className="spotify-player-controls-shuffle"
				onClick={shuffleHandler}
				value={<ShuffleIcon />}
			/>
			<SpotifyPlayerButton
				note="Previous"
				className="spotify-player-controls-previous"
				onClick={previousHandler}
				value={<PreviousIcon />}
			/>
			<SpotifyPlayerButton
				note={playPauseTooltip}
				className={playPauseClassName}
				onClick={playPauseHandler}
				value={playPauseIcon}
			/>
			<SpotifyPlayerButton
				note="Next"
				className="spotify-player-controls-next"
				onClick={nextHandler}
				value={<NextIcon />}
			/>
			<SpotifyPlayerButton
				note={repeatTooltip}
				active={repeatActive}
				className="spotify-player-controls-repeat"
				onClick={repeatHandler}
				value={repeatIcon}
			/>
			<SpotifyPlayerButton
				note="Copy"
				className="spotify-player-controls-copy"
				onClick={copyHandler}
				value={<CopyIcon />}
			/>
		</div>
	);
};

function SpotifyPlayerButton({ note, value, onClick, className, active, ...rest }) {
	return (
		<Tooltip note={note}>
			<Button
				className={`spotify-player-controls-btn ${className} ${active ? "enabled" : ""}`}
				size={Button.Sizes.NONE}
				color={Button.Colors.PRIMARY}
				look={Button.Looks.BLANK}
				onClick={onClick}
				{...rest}>
				{value}
			</Button>
		</Tooltip>
	);
}

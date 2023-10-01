import { React } from "@Api";
import SpotifyWrapper from "../SpotifyWrapper";

import Button from "@Components/Button";
import Popout from "@Components/Popout";
import ShareIcon from "@Components/ShareIcon";
import PauseIcon from "@Components/PauseIcon";
import PlayIcon from "@Components/PlayIcon";
import RepeatIcon from "@Components/RepeatIcon";
import ShuffleIcon from "@Components/ShuffleIcon";
import CopyIcon from "@Components/CopyIcon";
import NextIcon from "@Components/NextIcon";
import VolumeIcon from "@Components/VolumeIcon";
import Tooltip from "@Components/Tooltip";
import PreviousIcon from "@Components/PreviousIcon";
import RepeatOneIcon from "@Components/RepeatOneIcon";

import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

const { MenuItem, Menu, MenuGroup, Slider } = TheBigBoyBundle;

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

	const { trackUrl, volume } = data;
	const { shuffle, repeat, isPlaying } = state;
	const { toggling_shuffle, toggling_repeat_track, pausing, resuming, seeking, skipping_next, skipping_prev } = disallowedActions;

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
			<Tooltip note="Share in current channel">
				<SpotifyPlayerButton
					className="spotify-player-controls-share"
					onClick={shareHandler}
					value={<ShareIcon />}
				/>
			</Tooltip>
			<Tooltip note="shuffle">
				<SpotifyPlayerButton
					active={shuffle}
					className="spotify-player-controls-shuffle"
					onClick={shuffleHandler}
					value={<ShuffleIcon />}
				/>
			</Tooltip>
			<Tooltip note="Previous">
				<SpotifyPlayerButton
					className="spotify-player-controls-previous"
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
					onClick={nextHandler}
					value={<NextIcon />}
				/>
			</Tooltip>
			<Tooltip note={repeatTooltip}>
				<SpotifyPlayerButton
					active={repeatActive}
					className="spotify-player-controls-repeat"
					onClick={repeatHandler}
					value={repeatIcon}
				/>
			</Tooltip>
			<Tooltip note={"Copy"}>
				<SpotifyPlayerButton
					className="spotify-player-controls-copy"
					onClick={copyHandler}
					value={<CopyIcon />}
				/>
			</Tooltip>
			{/* <Popout
				renderPopout={() => (
					<div className="spotify-player-controls-volume-trackbar-wrapper">
						<Slider
							className="spotify-player-controls-volume-trackbar"
							mini={true}
							minValue={1}
							maxValue={100}
							initialValue={volume}
							equidistant={true}
							keyboardStep={1}
							stickToMarkers={false}
							orientation="vertical"
							markers={[0, 25, 50, 75, 100]}
							onValueChange={rangeChangeHandler}
							grabberClassName="spotify-player-controls-volume-trackbar-grabber"
							barClassName="spotify-player-controls-volume-trackbar-bar"
						/>
					 </div>
				 )}
				 position="top"
				 animation="1"
				 spacing={0}>*/}
				<SpotifyPlayerButton
					className="spotify-player-controls-volume"
					// onClick={copyHandler}
					value={<VolumeIcon />}
				/>
			{/*</Popout>*/}
		</div>
	);
};

function SpotifyPlayerButton({ note, value, onClick, className, active, ...rest }) {
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

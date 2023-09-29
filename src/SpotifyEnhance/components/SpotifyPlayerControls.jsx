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

export default ({ playerState }) => {
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
			{playerState.isPlaying ? (
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
			)}
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
};

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

import { React } from "@Api";
import Toast from "@Utils/Toast";
import UserStore from "@Stores/UserStore";
import SelectedChannelStore from "@Stores/SelectedChannelStore";
import { sendMessageDirectly, insertText } from "@Utils/Messages";
import SpotifyWrapper from "../SpotifyWrapper";
import Button from "@Components/Button";
import ShareIcon from "@Components/ShareIcon";
import PauseIcon from "@Components/PauseIcon";
import PlayIcon from "@Components/PlayIcon";
import RepeatIcon from "@Components/RepeatIcon";
import ShuffleIcon from "@Components/ShuffleIcon";
import CopyIcon from "@Components/CopyIcon";
import NextIcon from "@Components/NextIcon";
import PreviousIcon from "@Components/PreviousIcon";
import Tooltip from "@Components/Tooltip";

function ControlBtn({ value, onClick, className, enabled, ...rest }) {
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
	const [state, setState] = React.useState({
		deviceState: SpotifyWrapper.getDeviceState(),
		playerState: SpotifyWrapper.getPlayerState()
	});

	React.useEffect(() => {
		return SpotifyWrapper.on(() => {
			const deviceState = SpotifyWrapper.getDeviceState();
			const playerState = SpotifyWrapper.getPlayerState();

			setState({
				deviceState: deviceState,
				playerState: playerState
			});
		});
	}, []);

	return [state.deviceState, state.playerState];
}

export default React.memo(function SpotifyEmbedWrapper(props) {
	const [deviceState, playerState] = useSpotifyState();
	if (!deviceState) return;

	return <div className="spotify-player-container">{playerState && <SpotifyPlayerControls playerState={playerState} />}</div>;
});

function SpotifyPlayerControls({ playerState }) {
	const share = () => {
		const id = SelectedChannelStore.getCurrentlySelectedChannelId();
		if (!id) return;
		const content = playerState?.item?.external_urls?.spotify;
		if (!content) return Toast.error("Could not resolve url");
		sendMessageDirectly({ id }, content).catch(a => {
			Toast.error(a.message);
			insertText(content);
		});
	};

	const copy = () => {
		const content = playerState?.item?.external_urls?.spotify;
		if (!content) return Toast.error("Could not resolve url");
		SpotifyWrapper.Utils.copySpotifyLink(content);
	};

	return (
		<div className="spotify-player-controls">
			<Tooltip note="Share in current channel">
				<ControlBtn
					className="spotify-player-controls-share"
					onClick={share}
					value={<ShareIcon />}
				/>
			</Tooltip>
			<Tooltip note="shuffle">
				<ControlBtn
					enabled={playerState?.shuffle}
					className="spotify-player-controls-shuffle"
					// onClick={() => SpotifyWrapper.Player.shuffle()}
					value={<ShuffleIcon />}
				/>
			</Tooltip>
			<Tooltip note="Previous">
				<ControlBtn
					className="spotify-player-controls-previous"
					onClick={() => SpotifyWrapper.Player.previous()}
					value={<PreviousIcon />}
				/>
			</Tooltip>
			{playerState.isPlaying ? (
				<Tooltip note="Pause">
					<ControlBtn
						className="spotify-player-controls-pause"
						onClick={() => SpotifyWrapper.Player.pause()}
						value={<PauseIcon />}
					/>
				</Tooltip>
			) : (
				<Tooltip note="Play">
					<ControlBtn
						className="spotify-player-controls-play"
						onClick={() => SpotifyWrapper.Player.play()}
						value={<PlayIcon />}
					/>
				</Tooltip>
			)}
			<Tooltip note="Next">
				<ControlBtn
					className="spotify-player-controls-next"
					onClick={() => SpotifyWrapper.Player.next()}
					value={<NextIcon />}
				/>
			</Tooltip>
			<Tooltip note="Repeat">
				<ControlBtn
					className="spotify-player-controls-repeat"
					// onClick={() => SpotifyWrapper.Player.repeat()}
					value={<RepeatIcon />}
				/>
			</Tooltip>
			<Tooltip note="Copy">
				<ControlBtn
					className="spotify-player-controls-copy"
					onClick={copy}
					value={<CopyIcon />}
				/>
			</Tooltip>
		</div>
	);
}

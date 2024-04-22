import { React } from "@Api";
import Button from "@Components/Button";
import Popout from "@Components/Popout";
import Tooltip from "@Components/Tooltip";
import CopyIcon from "@Components/icons/CopyIcon";
import MuteVolumeIcon from "@Components/icons/MuteVolumeIcon";
import NextIcon from "@Components/icons/NextIcon";
import PauseIcon from "@Components/icons/PauseIcon";
import PlayIcon from "@Components/icons/PlayIcon";
import PreviousIcon from "@Components/icons/PreviousIcon";
import RepeatIcon from "@Components/icons/RepeatIcon";
import RepeatOneIcon from "@Components/icons/RepeatOneIcon";
import ShareIcon from "@Components/icons/ShareIcon";
import ShuffleIcon from "@Components/icons/ShuffleIcon";
import VolumeIcon from "@Components/icons/VolumeIcon";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import SpotifyApi from "../SpotifyAPIWrapper";
import { Store } from "../Store";
import { useSettings } from "@Utils/Hooks";

const { MenuItem, Menu } = TheBigBoyBundle;

export default ({ banner, media }) => {
	const playerButtons = useSettings("playerButtons");

	const isPlaying = Store(Store.selectors.isPlaying);
	const shuffle = Store(Store.selectors.shuffle);
	const repeat = Store(Store.selectors.repeat);
	const volume = Store(Store.selectors.volume);
	const actions = Store(Store.selectors.actions);

	const url = media?.external_urls?.spotify;
	const { toggling_shuffle, toggling_repeat_track, skipping_next, skipping_prev } = actions || {};

	const { repeatTooltip, repeatActive, repeatIcon, repeatArg } = {
		off: {
			repeatTooltip: "Repeat",
			repeatArg: "context",
			repeatIcon: <RepeatIcon />,
			repeatActive: false
		},
		context: {
			repeatTooltip: "Repeat track",
			repeatArg: "track",
			repeatIcon: <RepeatIcon />,
			repeatActive: true
		},
		track: {
			repeatTooltip: "Repeat off",
			repeatArg: "off",
			repeatIcon: <RepeatOneIcon />,
			repeatActive: true
		}
	}[repeat || "off"];

	const shuffleHandler = () => SpotifyApi.shuffle(!shuffle);
	const previousHandler = () => SpotifyApi.previous();
	const nextHandler = () => SpotifyApi.next();
	const repeatHandler = () => SpotifyApi.repeat(repeatArg);
	const pauseHandler = () => SpotifyApi.pause();
	const playHandler = () => SpotifyApi.play();

	const shareSongHandler = () => Store.Utils.share(url);
	const sharePosterHandler = () => Store.Utils.share(banner);

	const copySongHandler = () => Store.Utils.copySpotifyLink(url);
	const copyPosterHandler = () => Store.Utils.copySpotifyLink(banner);

	const { playPauseTooltip, playPauseHandler, playPauseIcon, playPauseClassName } = {
		true: {
			playPauseTooltip: "Pause",
			playPauseClassName: "spotify-player-controls-pause",
			playPauseHandler: pauseHandler,
			playPauseIcon: <PauseIcon />
		},
		false: {
			playPauseTooltip: "Play",
			playPauseClassName: "spotify-player-controls-play",
			playPauseHandler: playHandler,
			playPauseIcon: <PlayIcon />
		}
	}[isPlaying];

	return (
		<div className="spotify-player-controls">
			{playerButtons["Share"] && (
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
			)}
			{[
				playerButtons["Shuffle"] && { name: "Shuffle", value: <ShuffleIcon />, className: "spotify-player-controls-shuffle", disabled: toggling_shuffle, active: shuffle, onClick: shuffleHandler }, 
				playerButtons["Previous"] && { name: "Previous", value: <PreviousIcon />, className: "spotify-player-controls-previous", disabled: skipping_prev, onClick: previousHandler }, { name: playPauseTooltip, value: playPauseIcon, className: playPauseClassName, disabled: false, onClick: playPauseHandler }, 
				playerButtons["Next"] && { name: "Next", value: <NextIcon />, className: "spotify-player-controls-next", disabled: skipping_next, onClick: nextHandler }, 
				playerButtons["Repeat"] && { name: repeatTooltip, value: repeatIcon, className: "spotify-player-controls-repeat", disabled: toggling_repeat_track, active: repeatActive, onClick: repeatHandler }
			].filter(Boolean).map(SpotifyPlayerButton)}
			{playerButtons["Volume"] && <Volume volume={volume} />}
		</div>
	);
};

function SpotifyPlayerButton({ className, active, name, value, ...rest }) {
	return (
		<Tooltip note={name}>
			<Button
				className={`spotify-player-controls-btn ${className} ${active ? "enabled" : ""}`}
				size={Button.Sizes.NONE}
				color={Button.Colors.PRIMARY}
				look={Button.Looks.BLANK}
				{...rest}>
				{value}
			</Button>
		</Tooltip>
	);
}

function Volume({ volume }) {
	const [val, setVal] = React.useState(volume);
	const [active, setActive] = React.useState(false);
	const volumeRef = React.useRef(volume || 25);

	React.useEffect(() => {
		if (volume) volumeRef.current = volume;
		if (!active) setVal(volume);
	}, [volume]);

	const volumeMuteHandler = () => {
		const target = val ? 0 : volumeRef.current;
		SpotifyApi.volume(target).then(() => {
			setVal(target);
		});
	};

	const volumeOnChange = e => setVal(Math.round(e.target.value));
	const volumeOnMouseDown = () => setActive(true);
	const volumeOnMouseUp = () => {
		setActive(false);
		SpotifyApi.volume(val).then(() => (volumeRef.current = val));
	};

	return (
		<Popout
			renderPopout={() => (
				<div className="spotify-player-controls-volume-slider-wrapper">
					<input
						value={val}
						onChange={volumeOnChange}
						onMouseUp={volumeOnMouseUp}
						onMouseDown={volumeOnMouseDown}
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

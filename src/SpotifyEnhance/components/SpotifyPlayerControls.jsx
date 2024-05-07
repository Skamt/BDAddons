import { React } from "@Api";
import Button from "@Components/Button";
import Popout from "@Components/Popout";
import Tooltip from "@Components/Tooltip";
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
import ImageIcon from "@Components/icons/ImageIcon";
import ListenIcon from "@Components/icons/ListenIcon";
import { PlayerButtonsEnum } from "../consts.js";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import SpotifyApi from "../SpotifyAPIWrapper";
import { Store } from "../Store";
import Settings from "@Utils/Settings";
import { shallow } from "@Utils";

const { MenuItem, Menu } = TheBigBoyBundle;

const pauseHandler = () => SpotifyApi.pause();
const playHandler = () => SpotifyApi.play();
const previousHandler = () => SpotifyApi.previous();
const nextHandler = () => SpotifyApi.next();

const playpause = {
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
};

const repeatObj = {
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
};

export default () => {
	const playerButtons = Settings(Settings.selectors.playerButtons, shallow);
	const [isPlaying, shuffle, repeat, volume] = Store(_ => [_.isPlaying, _.shuffle, _.repeat, _.volume], shallow);
	const actions = Store(Store.selectors.actions, shallow);
	const url = Store.state.getSongUrl();
	const { bannerLg } = Store.state.getSongBanners();

	const { toggling_shuffle, toggling_repeat_track, skipping_next, skipping_prev } = actions || {};

	const { repeatTooltip, repeatActive, repeatIcon, repeatArg } = repeatObj[repeat || "off"];

	const shuffleHandler = () => SpotifyApi.shuffle(!shuffle);
	const repeatHandler = () => SpotifyApi.repeat(repeatArg);
	const shareSongHandler = () => Store.Utils.share(url);
	const sharePosterHandler = () => Store.Utils.share(bannerLg.url);
	const copySongHandler = () => Store.Utils.copySpotifyLink(url);
	const copyPosterHandler = () => Store.Utils.copySpotifyLink(bannerLg.url);

	const { playPauseTooltip, playPauseHandler, playPauseIcon, playPauseClassName } = playpause[isPlaying];

	return (
		<div className="spotify-player-controls">
			{playerButtons[PlayerButtonsEnum.SHARE] && (
				<Popout
					renderPopout={t => (
						<Menu onClose={t.closePopout}>
							<MenuItem
								className="spotify-player-share-menuitem"
								id="copy-song-link"
								key="copy-song-link"
								icon={ListenIcon}
								action={copySongHandler}
								label="Copy song url"
							/>
							<MenuItem
								className="spotify-player-share-menuitem"
								id="copy-poster-link"
								key="copy-poster-link"
								action={copyPosterHandler}
								icon={ImageIcon}
								label="Copy poster url"
							/>
							<MenuItem
								className="spotify-player-share-menuitem"
								id="share-song-link"
								key="share-song-link"
								action={shareSongHandler}
								icon={ListenIcon}
								label="Share song in current channel"
							/>
							<MenuItem
								className="spotify-player-share-menuitem"
								id="share-poster-link"
								key="share-poster-link"
								action={sharePosterHandler}
								icon={ImageIcon}
								label="Share poster in current channel"
							/>
						</Menu>
					)}
					align="left"
					position="top"
					animation="1"
					className="spotify-player-controls-share">
					<SpotifyPlayerButton value={<ShareIcon />} />
				</Popout>
			)}
			{[playerButtons[PlayerButtonsEnum.SHUFFLE] && { name: "Shuffle", value: <ShuffleIcon />, className: "spotify-player-controls-shuffle", disabled: toggling_shuffle, active: shuffle, onClick: shuffleHandler }, playerButtons[PlayerButtonsEnum.PREVIOUS] && { name: "Previous", value: <PreviousIcon />, className: "spotify-player-controls-previous", disabled: skipping_prev, onClick: previousHandler }, { name: playPauseTooltip, value: playPauseIcon, className: playPauseClassName, disabled: false, onClick: playPauseHandler }, playerButtons[PlayerButtonsEnum.NEXT] && { name: "Next", value: <NextIcon />, className: "spotify-player-controls-next", disabled: skipping_next, onClick: nextHandler }, playerButtons[PlayerButtonsEnum.REPEAT] && { name: repeatTooltip, value: repeatIcon, className: "spotify-player-controls-repeat", disabled: toggling_repeat_track, active: repeatActive, onClick: repeatHandler }].filter(Boolean).map(SpotifyPlayerButton)}
			{playerButtons[PlayerButtonsEnum.VOLUME] && <Volume volume={volume} />}
		</div>
	);
};

function SpotifyPlayerButton({ className, active, name, value, ...rest }) {
	return (
		<Tooltip note={name}>
			<Button
				innerClassName="flexCenterCenter"
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
			className="spotify-player-controls-volume"
			spacing={8}>
			<SpotifyPlayerButton
				onClick={volumeMuteHandler}
				value={val ? <VolumeIcon /> : <MuteVolumeIcon />}
			/>
		</Popout>
	);
}

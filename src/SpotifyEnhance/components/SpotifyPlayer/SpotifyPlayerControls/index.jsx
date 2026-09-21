import "./styles";
import React from "@React";
import ControlButton from "@/components/ControlButton";
import HoverPopout from "@Components/HoverPopout";
import Tooltip from "@Components/Tooltip";
import { MuteVolumeIcon, NextIcon, PauseIcon, CopyIcon, PlayIcon, PreviousIcon, RepeatIcon, RepeatOneIcon, ShareIcon, ShuffleIcon, VolumeIcon, ImageIcon, ListenIcon, AddToQueueIcon } from "@Components/Icon";

import { PlayerButtonsEnum } from "@/consts.js";
import { storeContextMenu } from "@/contextmenu.js";
import { spotifyShare } from "@/utils";
import { ContextMenu } from "@Api";
import Store from "@/store";
import Settings from "@Utils/Settings";
import { copy, shallow } from "@Utils";
import { classNameFactory } from "@Utils/css";
const c = classNameFactory("spotify-player-controls");

const pauseHandler = () => Store.Api.pause();
const playHandler = () => Store.Api.play();
const previousHandler = () => Store.Api.previous();
const nextHandler = () => Store.Api.next();

const playpause = {
	true: {
		playPauseTooltip: "Pause",
		playPauseClassName: c("btn", "pause"),
		playPauseHandler: pauseHandler,
		playPauseIcon: <PauseIcon />
	},
	false: {
		playPauseTooltip: "Play",
		playPauseClassName: c("btn", "play"),
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
	const context = Store(Store.selectors.context, (n, o) => n?.uri === o?.uri);
	const { bannerLg } = Store.getSongBanners();

	const { toggling_shuffle, toggling_repeat_track, skipping_next, skipping_prev } = actions || {};

	const { repeatTooltip, repeatActive, repeatIcon, repeatArg } = repeatObj[repeat || "off"];

	const shuffleHandler = () => Store.Api.shuffle(!shuffle);
	const repeatHandler = () => Store.Api.repeat(repeatArg);

	const { playPauseTooltip, playPauseHandler, playPauseIcon, playPauseClassName } = playpause[isPlaying];

	return (
		<div className="spotify-player-controls">
			{playerButtons[PlayerButtonsEnum.SHARE] && (
				<HoverPopout popout={e => <ContextMenu.Menu onClose={e.closePopout}>{ContextMenu.buildMenuChildren(storeContextMenu(Store.getSongUrl(), bannerLg.url))}</ContextMenu.Menu>}>
					<ControlButton
						className={c("btn", "share")}
						value={<ShareIcon />}
					/>
				</HoverPopout>
			)}
			{[
				playerButtons[PlayerButtonsEnum.SHUFFLE] && {
					tooltip: "Shuffle",
					value: <ShuffleIcon />,
					className: c("btn", "shuffle"),
					disabled: toggling_shuffle,
					active: shuffle,
					onClick: shuffleHandler
				},
				playerButtons[PlayerButtonsEnum.PREVIOUS] && {
					tooltip: "Previous",
					value: <PreviousIcon />,
					className: c("btn", "previous"),
					disabled: skipping_prev,
					onClick: previousHandler
				},
				{
					tooltip: playPauseTooltip,
					value: playPauseIcon,
					className: playPauseClassName,
					disabled: false,
					onClick: playPauseHandler
				},
				playerButtons[PlayerButtonsEnum.NEXT] && {
					tooltip: "Next",
					value: <NextIcon />,
					className: c("btn", "next"),
					disabled: skipping_next,
					onClick: nextHandler
				},
				playerButtons[PlayerButtonsEnum.REPEAT] && {
					tooltip: repeatTooltip,
					value: repeatIcon,
					className: c("btn", "repeat"),
					disabled: toggling_repeat_track,
					active: repeatActive,
					onClick: repeatHandler
				}
			]
				.filter(Boolean)
				.map(ControlButton)}
			{playerButtons[PlayerButtonsEnum.VOLUME] && <Volume volume={volume} />}
		</div>
	);
};

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
		Store.Api.volume(target).then(() => {
			setVal(target);
		});
	};

	const volumeOnChange = e => setVal(Math.round(e.target.value));
	const volumeOnMouseDown = () => setActive(true);
	const volumeOnMouseUp = () => {
		setActive(false);
		Store.Api.volume(val).then(() => (volumeRef.current = val));
	};

	return (
		<HoverPopout
			popout={() => (
				<div className={c("volume-slider-wrapper")}>
					<input
						value={val}
						onChange={volumeOnChange}
						onMouseUp={volumeOnMouseUp}
						onMouseDown={volumeOnMouseDown}
						type="range"
						step="1"
						min="0"
						max="100"
						className={c("volume-slider")}
					/>
					<div className={c("volume-label")}>{val}</div>
				</div>
			)}
			position="top"
			align="center"
			animation="1"
			spacing={8}>
			<ControlButton
				className={c("btn", "volume")}
				onClick={volumeMuteHandler}
				value={val ? <VolumeIcon /> : <MuteVolumeIcon />}
			/>
		</HoverPopout>
	);
}

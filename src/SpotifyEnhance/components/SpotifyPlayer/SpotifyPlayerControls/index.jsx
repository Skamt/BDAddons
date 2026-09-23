import "./styles";
import ControlButton from "@/components/ControlButton";
import HoverPopout from "@Components/HoverPopout";
import { MuteVolumeIcon, NextIcon, PauseIcon, PlayIcon, PreviousIcon, RepeatIcon, RepeatOneIcon, ShareIcon, ShuffleIcon, VolumeIcon } from "@Components/Icon";

import React from "@React";
import { PlayerButtonsEnum } from "@/consts.js";
import { storeContextMenu } from "@/contextmenu.js";
import Store from "@/store";
import { ContextMenu } from "@Api";
import { shallow } from "@Utils";
import Settings from "@Utils/Settings";
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
	const [isPlaying, shuffle, repeat] = Store(_ => [_.isPlaying, _.shuffle, _.repeat], shallow);
	const actions = Store(Store.selectors.actions, shallow);
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
					className: c("btn", "shuffle", { enabled: shuffle }),
					disabled: toggling_shuffle,
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
					className: c("btn", "repeat", { enabled: repeatActive }),
					disabled: toggling_repeat_track,
					onClick: repeatHandler
				}
			]
				.filter(Boolean)
				.map(ControlButton)}
			{playerButtons[PlayerButtonsEnum.VOLUME] && <Volume />}
		</div>
	);
};

function Volume() {
	const volume = Store(Store.selectors.volume, shallow);
	const [uiVolume, setUiVolume] = React.useState(volume);
	const volumeRef = React.useRef(volume || 25);

	const volumeMuteHandler = () => {
		const target = uiVolume ? 0 : volumeRef.current;
		Store.Api.volume(target).then(() => {
			setUiVolume(target);
		});
	};

	const volumeOnChange = e => setUiVolume(Math.round(e.target.value));
	const volumeOnMouseUp = () => {
		Store.Api.volume(uiVolume).then(() => {
			volumeRef.current = uiVolume;
		});
	};

	return (
		<HoverPopout
			popout={() => (
				<div className={c("volume-slider-wrapper")}>
					<input
						value={uiVolume}
						onChange={volumeOnChange}
						onMouseUp={volumeOnMouseUp}
						type="range"
						step="1"
						min="0"
						max="100"
						className={c("volume-slider")}
					/>
					<div className={c("volume-label")}>{uiVolume}</div>
				</div>
			)}
			position="top"
			align="center"
			animation="1"
			spacing={8}>
			<ControlButton
				className={c("btn", "volume")}
				onClick={volumeMuteHandler}
				value={uiVolume ? <VolumeIcon /> : <MuteVolumeIcon />}
			/>
		</HoverPopout>
	);
}

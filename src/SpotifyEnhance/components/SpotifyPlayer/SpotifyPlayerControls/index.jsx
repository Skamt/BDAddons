import "./styles";
import ControlButton from "@/components/ControlButton";
import HoverPopout from "@Components/HoverPopout";
import { MuteVolumeIcon, NextIcon, PauseIcon, PlayIcon, PreviousIcon, RepeatIcon, RepeatOneIcon, ShareIcon, ShuffleIcon, VolumeIcon } from "@Components/Icon";

import React, { useRef, useState } from "@React";
import { storeContextMenu } from "@/contextmenu.js";
import Store from "@/store";
import { ContextMenu } from "@Api";
import { shallow } from "@Utils";
import Settings from "@Settings";
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
	const shareBtn = Settings.Share();
	const shuffleBtn = Settings.Shuffle();
	const previousBtn = Settings.Previous();
	const nextBtn = Settings.Next();
	const repeatBtn = Settings.Repeat();
	const volumeBtn = Settings.Volume();

	const [isPlaying, shuffle, repeat] = Store(_ => [_.isPlaying, _.shuffle, _.repeat], shallow);
	const actions = Store(Store.selectors.actions, shallow);
	const { bannerLg } = Store.getSongBanners();

	const { toggling_shuffle, toggling_repeat_track, skipping_next, skipping_prev } = actions || {};
	const { repeatTooltip, repeatActive, repeatIcon, repeatArg } = repeatObj[repeat || "off"];

	const { playPauseTooltip, playPauseHandler, playPauseIcon, playPauseClassName } = playpause[isPlaying];

	return (
		<div className="spotify-player-controls">
			{shareBtn && (
				<HoverPopout popout={e => <ContextMenu.Menu onClose={e.closePopout}>{ContextMenu.buildMenuChildren(storeContextMenu(Store.getSongUrl(), bannerLg.url))}</ContextMenu.Menu>}>
					<ControlButton
						className={c("btn", "share")}
						value={<ShareIcon />}
					/>
				</HoverPopout>
			)}
			{[
				shuffleBtn && {
					tooltip: "Shuffle",
					value: <ShuffleIcon />,
					className: c("btn", "shuffle", { enabled: shuffle }),
					disabled: toggling_shuffle,
					onClick: () => Store.Api.shuffle(!shuffle)
				},
				previousBtn && {
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
				nextBtn && {
					tooltip: "Next",
					value: <NextIcon />,
					className: c("btn", "next"),
					disabled: skipping_next,
					onClick: nextHandler
				},
				repeatBtn && {
					tooltip: repeatTooltip,
					value: repeatIcon,
					className: c("btn", "repeat", { enabled: repeatActive }),
					disabled: toggling_repeat_track,
					onClick: () => Store.Api.repeat(repeatArg)
				}
			]
				.filter(Boolean)
				.map(ControlButton)}
			{volumeBtn && <Volume />}
		</div>
	);
};

function Volume() {
	const volume = Store(Store.selectors.volume, shallow);
	const [uiVolume, setUiVolume] = useState(volume);
	const volumeRef = useRef(volume || 25);

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

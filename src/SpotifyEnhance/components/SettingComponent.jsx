import { React } from "@Api";
import Switch from "@Components/Switch";
import Button from "@Components/Button";
import Tooltip from "@Components/Tooltip";
import NextIcon from "@Components/icons/NextIcon";
import PlayIcon from "@Components/icons/PlayIcon";
import PreviousIcon from "@Components/icons/PreviousIcon";
import RepeatIcon from "@Components/icons/RepeatIcon";
import ShareIcon from "@Components/icons/ShareIcon";
import ShuffleIcon from "@Components/icons/ShuffleIcon";
import VolumeIcon from "@Components/icons/VolumeIcon";
import Settings from "@Utils/Settings";
import { Filters, getModule } from "@Webpack";
import { EmbedStyleEnum } from "../consts.js";

import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
const { FormDivider, Heading } = TheBigBoyBundle;

const Group = getModule(Filters.byStrings("groupCollapsedRow"));
const Flex = getModule(a => a.Flex).Flex;

function useSetting(setting) {
	return {
		get: React.useCallback(() => Settings.get(setting), []),
		set: React.useCallback(e => Settings.set(setting, e), [])
	};
}

function SpotifyEmbedOptions() {
	const { get, set } = useSetting("spotifyEmbed");
	return (
		<div>
			<Group
				changeTitle="Change Spotify embed style"
				options={[
					{
						value: EmbedStyleEnum.KEEP,
						highlightColor: "statusGreen",
						description: "Use original Spotify Embed"
					},
					{
						value: EmbedStyleEnum.REPLACE,
						highlightColor: "statusGreen",
						description: "A less laggy Spotify Embed"
					},
					{
						value: EmbedStyleEnum.HIDE,
						highlightColor: "statusGreen",
						description: "Completely remove spotify embed"
					}
				]}
				value={get()}
				onChange={e => set(e.value)}
			/>
		</div>
	);
}

function SettingsToggle({ settingKey, note, hideBorder = false, description }) {
	const { get, set } = useSetting(settingKey);
	const [enabled, setEnabled] = React.useState(get());
	return (
		<Switch
			value={enabled}
			note={note}
			hideBorder={hideBorder}
			onChange={e => {
				set(e);
				setEnabled(e);
			}}>
			{description}
		</Switch>
	);
}

const Switches = [
	{
		settingKey: "player",
		description: "Enable/Disable player."
	},
	{
		settingKey: "activity",
		description: "Modify Spotify activity."
	},
	{
		settingKey: "activityIndicator",
		description: "Show user's Spotify activity in chat."
	},
	{
		settingKey: "playerBannerBackground",
		description: "Use the banner as background for the player."
	},
	{
		settingKey: "embedBannerBackground",
		description: "Use the banner as background for the embed."
	}
];

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

function PlayerBtn({ name, value, className, disabled }) {
	const { get, set } = useSetting("playerButtons");
	const [, update] = React.useReducer(e => e + 1, 0);

	const handler = e => {
		const btnObj = get();
		set(Object.assign({}, btnObj, { [e]: !btnObj[e] }));
		update();
	};

	const val = name === "Play" ? true : get()[name];

	return (
		<Tooltip note={val ? `${name} will be shown` : `${name} will be hidden`}>
			<SpotifyPlayerButton
				active={val}
				disabled={disabled}
				className={className}
				onClick={() => handler(name)}
				value={value}
			/>
		</Tooltip>
	);
}

function Brrr() {
	return (
		<Flex
			style={{ marginTop: 15 }}
			direction={Flex.Direction.HORIZONTAL}
			align={Flex.Align.CENTER}
			>
			<Heading
				tag="h5"
				style={{ whiteSpace:"nowrap", flex:"1", marginBottom: 5 }}>
				Show/Hide player buttons
			</Heading>
			<div className="spotify-player-controls">
				{[
					{ className: "spotify-player-controls-share", name: "Share", value: <ShareIcon /> },
					{ className: "spotify-player-controls-shuffle", name: "Shuffle", value: <ShuffleIcon /> },
					{ className: "spotify-player-controls-previous", name: "Previous", value: <PreviousIcon /> },
					{ className: "spotify-player-controls-play", name: "Play", value: <PlayIcon />, disabled: true },
					{ className: "spotify-player-controls-next", name: "Next", value: <NextIcon /> },
					{ className: "spotify-player-controls-repeat", name: "Repeat", value: <RepeatIcon /> },
					{ className: "spotify-player-controls-volume", name: "Volume", value: <VolumeIcon /> }
				].map(PlayerBtn)}
			</div>
		</Flex>
	);
}

export default function () {
	return (
		<div className={`${config.info.name}-settings`}>
			<FormDivider style={{ marginBottom: 20 }} />
			{Switches.map(SettingsToggle)}
			<SpotifyEmbedOptions />
			<FormDivider style={{ marginTop: 20 }} />
			<Brrr />
		</div>
	);
}

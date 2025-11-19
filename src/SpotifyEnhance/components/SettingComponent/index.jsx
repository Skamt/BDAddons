import config from "@Config";
import React from "@React";
import Collapsible from "@Components/Collapsible";
import Gap from "@Components/Gap";

import FieldSet from "@Components/FieldSet";
import Divider from "@Components/Divider";
import SettingSwtich from "@Components/SettingSwtich";
import { RadioGroup } from "@Discord/Modules";
import Settings from "@Utils/Settings";
import { PlayerButtonsEnum, PlayerPlaceEnum, EmbedStyleEnum } from "@/consts.js";
import Plugin from "@Utils/Plugin";

function SpotifyEmbedOptions() {
	const [val, set] = Settings.useSetting("spotifyEmbed");
	return (
		<RadioGroup
			options={[
				{
					value: EmbedStyleEnum.KEEP,
					name: "Keep: Use original Spotify Embed"
				},
				{
					value: EmbedStyleEnum.REPLACE,
					name: "Replace: A less laggy Spotify Embed"
				},
				{
					value: EmbedStyleEnum.HIDE,
					name: "Hide: Completely remove spotify embed"
				}
			]}
			orientation={"horizontal"}
			value={val}
			onChange={e => set(e.value)}
		/>
	);
}

function SpotifyPLayerOptions() {
	const [val, set] = Settings.useSetting("spotifyPlayerPlace");
	return (
		<RadioGroup
			options={[
				{
					value: PlayerPlaceEnum.PIP,
					name: "PIP: place the player in a draggable picture-in-picture"
				},
				{
					value: PlayerPlaceEnum.USERAREA,
					name: "USERAREA: place the player in the user area (bottom left)"
				}
			]}
			orientation={"horizontal"}
			value={val}
			onChange={e => {
				set(e.value);
			}}
		/>
	);
}

export default function SettingComponent() {
	return (
		<div className={`${config.info.name}-settings`}>
			<Collapsible title="miscellaneous">
				<FieldSet contentGap={8}>
					{[
						{
							settingKey: "player",
							description: "Enable/Disable player."
						},
						{
							settingKey: "enableListenAlong",
							description: "Enables/Disable listen along without premium."
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
							settingKey: "playerCompactMode",
							description: "Player compact mode"
						},
						{
							settingKey: "playerBannerBackground",
							description: "Use the banner as background for the player."
						},
						{
							settingKey: "embedBannerBackground",
							description: "Use the banner as background for the embed."
						}
					].map(SettingSwtich)}
				</FieldSet>
			</Collapsible>
			<Gap gap={15} />
			<Collapsible title="Show/Hide Player buttons">
				<FieldSet contentGap={8}>
					{[
						{ settingKey: PlayerButtonsEnum.SHARE, hideBorder: true },
						{ settingKey: PlayerButtonsEnum.SHUFFLE, hideBorder: true },
						{ settingKey: PlayerButtonsEnum.PREVIOUS, hideBorder: true },
						{ settingKey: PlayerButtonsEnum.PLAY, hideBorder: true },
						{ settingKey: PlayerButtonsEnum.NEXT, hideBorder: true },
						{ settingKey: PlayerButtonsEnum.REPEAT, hideBorder: true },
						{ settingKey: PlayerButtonsEnum.VOLUME, hideBorder: true, style: { marginBottom: 0 } }
					].map(SettingSwtich)}
				</FieldSet>
			</Collapsible>
			<Gap gap={15} />
			<Collapsible title="Spotify embed style">
				<SpotifyEmbedOptions />
			</Collapsible>
			<Gap gap={15} />
			{/*<Collapsible title="Spotify player placement">
				<SpotifyPLayerOptions />
			</Collapsible>*/}
		</div>
	);
}

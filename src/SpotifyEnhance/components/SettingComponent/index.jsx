import { EmbedStyleEnum  } from "@/consts.js";
import Collapsible from "@Components/Collapsible";
import FieldSet from "@Components/FieldSet";
import Gap from "@Components/Gap";
import SettingSwtich from "@Components/SettingSwtich";
import config from "@Config";
import { RadioGroup } from "@Discord/Modules";
import React from "@React";
import Settings from "@Settings";

function SpotifyEmbedOptions() {
	const val = Settings.spotifyEmbed();
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
			onChange={e => Settings.spotifyEmbed.set(e.value)}
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
							setting: Settings.player,
							description: "Enable/Disable player."
						},
						{
							setting: Settings.enableListenAlong,
							description: "Enables/Disable listen along without premium."
						},
						{
							setting: Settings.activity,
							description: "Modify Spotify activity."
						},
						{
							setting: Settings.activityIndicator,
							description: "Show user's Spotify activity in chat."
						},
						{
							setting: Settings.playerCompactMode,
							description: "Player compact mode"
						},
						{
							setting: Settings.playerBannerBackground,
							description: "Use the banner as background for the player."
						},
						{
							setting: Settings.embedBannerBackground,
							description: "Use the banner as background for the embed."
						}
					].map(SettingSwtich)}
				</FieldSet>
			</Collapsible>
			<Gap gap={15} />
			<Collapsible title="Show/Hide Player buttons">
				<FieldSet contentGap={8}>
					{[
						{ setting: Settings.Share, hideBorder: true },
						{ setting: Settings.Shuffle, hideBorder: true },
						{ setting: Settings.Previous, hideBorder: true },
						{ setting: Settings.Play, hideBorder: true },
						{ setting: Settings.Next, hideBorder: true },
						{ setting: Settings.Repeat, hideBorder: true },
						{ setting: Settings.Volume, hideBorder: true }
					].map(SettingSwtich)}
				</FieldSet>
			</Collapsible>
			<Gap gap={15} />
			<Collapsible title="Spotify embed style">
				<SpotifyEmbedOptions />
			</Collapsible>
		</div>
	);
}







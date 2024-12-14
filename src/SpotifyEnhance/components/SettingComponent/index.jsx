import { React } from "@Api";
import Collapsible from "@Components/Collapsible";
import SettingSwtich from "@Components/SettingSwtich";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import Settings from "@Utils/Settings";
import { PlayerButtonsEnum, PlayerPlaceEnum, EmbedStyleEnum } from "../../consts.js";
import {cleanFluxContainer} from "../../patches/patchSpotifyPlayer";

const { FormDivider, RadioGroup } = TheBigBoyBundle;

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
				},
			]}
			orientation={"horizontal"}
			value={val}
			onChange={e => {
				cleanFluxContainer();
				set(e.value);
			}}
		/>
	);
}

export default function () {
	return (
		<div className={`${config.info.name}-settings`}>
			<Collapsible title="miscellaneous">
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
						description: "Use the banner as background for the embed.",
						hideBorder: true
					}
				].map(SettingSwtich)}
			</Collapsible>
			<FormDivider style={{ margin: "20px 0 20px 0" }} />
			<Collapsible title="Show/Hide Player buttons">{[{ settingKey: PlayerButtonsEnum.SHARE }, { settingKey: PlayerButtonsEnum.SHUFFLE }, { settingKey: PlayerButtonsEnum.PREVIOUS }, { settingKey: PlayerButtonsEnum.PLAY }, { settingKey: PlayerButtonsEnum.NEXT }, { settingKey: PlayerButtonsEnum.REPEAT }, { settingKey: PlayerButtonsEnum.VOLUME, hideBorder: true }].map(SettingSwtich)}</Collapsible>
			<FormDivider style={{ margin: "20px 0 20px 0" }} />
			<Collapsible title="Spotify embed style">
				<SpotifyEmbedOptions />
			</Collapsible>
			<FormDivider style={{ margin: "20px 0 20px 0" }} />
			<Collapsible title="Spotify player placement">
				<SpotifyPLayerOptions />
			</Collapsible>
		</div>
	);
}

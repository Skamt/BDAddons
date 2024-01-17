import { React } from "@Api";
import Switch from "@Components/Switch";
import Settings from "@Utils/Settings";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import { EmbedStyleEnum } from "../consts.js";
const { Heading, RadioGroup } = TheBigBoyBundle;

function useSetting(setting) {
	return {
		get: React.useCallback(() => Settings.get(setting), []),
		set: React.useCallback(e => Settings.set(setting, e), [])
	};
}

function SpotifyEmbedOptions() {
	const { get, set } = useSetting("spotifyEmbed");
	const [selected, setSelected] = React.useState(get());
	return (
		<>
			<Heading
				style={{ marginBottom: 15 }}
				tag="h5">
				spotify embed style
			</Heading>
			<RadioGroup
				options={[
					{
						"value": EmbedStyleEnum.KEEP,
						"name": "Keep: Use original Spotify Embed"
					},
					{
						"value": EmbedStyleEnum.REPLACE,
						"name": "Replace: A less laggy Spotify Embed"
					},
					{
						"value": EmbedStyleEnum.HIDE,
						"name": "Hide: Completely remove spotify embed"
					}
				]}
				orientation={"horizontal"}
				value={selected}
				onChange={e => {
					set(e.value);
					setSelected(e.value);
				}}
			/>
		</>
	);
}

function PlayerState() {
	const { get, set } = useSetting("player");
	const [enabled, setEnabled] = React.useState(get());
	return (
		<Switch
			value={enabled}
			hideBorder={false}
			onChange={e => {
				set(e);
				setEnabled(e);
			}}>
			Enable/Disable player
		</Switch>
	);
}

function ActivityState() {
	const { get, set } = useSetting("activity");
	const [enabled, setEnabled] = React.useState(get());
	return (
		<Switch
			value={enabled}
			hideBorder={false}
			onChange={e => {
				set(e);
				setEnabled(e);
			}}>
			Modify activity
		</Switch>
	);
}

export default [<PlayerState />, <ActivityState />, <SpotifyEmbedOptions />];

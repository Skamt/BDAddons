import { React } from "@Api";
import Settings from "@Utils/Settings";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import { EmbedStyleEnum } from "../consts.js";

const Heading = TheBigBoyBundle.Heading;

const { RadioGroup } = TheBigBoyBundle;
function SpotifyEmbedOptions() {
	const [selected, setSelected] = React.useState(Settings.get("spotifyEmbed"));
	return (
		<>
			<Heading tag="h5">spotify embed style</Heading>
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
					Settings.set("spotifyEmbed", e.value);
					setSelected(e.value);
				}}
			/>
		</>
	);
}

export default <SpotifyEmbedOptions />;

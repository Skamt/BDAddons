import { React } from "@Api";
import Settings from "@Utils/Settings";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import Heading from "@Modules/Heading";
import { EmbedStyleEnum } from "../consts.js";

export default <SpotifyEmbedOptions />;

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

import { React } from "@Api";
import Settings from "@Utils/Settings";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import { EmbedStyleEnum } from "../consts.js";
const { RadioGroup } = TheBigBoyBundle;
export default () => {
	return <SpotifyEmbedOptions />;
};

const Heading = getModule(Filters.byStrings("LEGEND", "LABEL"), { searchExports: true });
function SpotifyEmbedOptions() {
	const [selected, setSelected] = React.useState(Settings.get("spotifyEmbed"));
	return (
		<>
			<Heading tag="h5">spotify embed style</Heading>
			<RadioGroup
				options={[
					{
						"value": "KEEP",
						"name": "Keep: Use original Spotify Embed"
					},
					{
						"value": "REPLACE",
						"name": "Replace: A less laggy Spotify Embed"
					},
					{
						"value": "HIDE",
						"name": "Hide: Completely remove spotify embed"
					}
				]}
				orientation={"horizontal"}
				value={EmbedStyleEnum[selected]}
				onChange={e => {
					const val = EmbedStyleEnum[e.value];
					Settings.set("spotifyEmbed", val);
					setSelected(val);
				}}
			/>
		</>
	);
}

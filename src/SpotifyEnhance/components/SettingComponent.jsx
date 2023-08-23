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
				value={EmbedStyleEnum[selected]}
				onChange={e => {
					Settings.set("spotifyEmbed", EmbedStyleEnum[e.value]);
					setSelected(EmbedStyleEnum[e.value]);
				}}
			/>
		</>
	);
}

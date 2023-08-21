import { React } from "@Api";
import Settings from "@Utils/Settings";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

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
						"value": "keep",
						"name": "Keep: Use original Spotify Embed"
					},
					{
						"value": "replace",
						"name": "Replace: A less laggy Spotify Embed"
					},
					{
						"value": "hide",
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

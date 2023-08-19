import { React } from "@Api";
import Settings from "@Utils/Settings";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

const { RadioGroup } = TheBigBoyBundle;
export default () => {
	return <SpotifyEmbedOptions />;
};

function SpotifyEmbedOptions() {
	return (
		<div style={{ display: "flex" }}>
			<RadioGroup
				options={[
					{
						"name": "keep",
						"name": "Keep: Use original Spotify Embed"
					},{
						"value": "replace",
						"name": "Replace: A less laggy Spotify Embed"
					},{
						"value": "hide",
						"name": "Hide: Completely remove spotify embed"
					}
				]}
				orientation={"horizontal"}
				value={Settings.get("spotifyEmbed")}
				onChange={e => Settings.set("spotifyEmbed", e.value)}
			/>
		</div>
	);
}

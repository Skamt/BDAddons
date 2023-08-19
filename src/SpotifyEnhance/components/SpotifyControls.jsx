import { React } from "@Api";
import Button from "@Components/Button";
import SpotifyStore from "@Stores/SpotifyStore";
import { useSettings, useStateFromStore } from "@Utils/Hooks";
import SpotifyEmbed from "./SpotifyEmbed";
import { addTrackToQueue, playTrack } from "../SpotifyWrapper";

export default ({ og, embed, trackId }) => {
	console.log(embed);
	let view = og;
	const spotifySocket = useStateFromStore(SpotifyStore, () => SpotifyStore.getActiveSocketAndDevice()?.socket);
	const spotifyEmbed = useSettings("spotifyEmbed");

	const canDoStuff = !!spotifySocket;

	if (spotifyEmbed === "replace")
		return (
			<SpotifyEmbed
				enabled={canDoStuff}
				embed={embed}
				trackId={trackId}
			/>
		);

	if (spotifyEmbed === "keep") return [og, <SpotifyControls enabled={canDoStuff} />];
	if (spotifyEmbed === "hide") return <SpotifyControls enabled={canDoStuff} />;
};

function SpotifyControls({ enabled }) {
	const addToQueueHandler = () => addTrackToQueue(trackId);
	const playHandler = () => playTrack(trackId);
	return (
		<div class="spotify-controls">
			<Button
				enabled={enabled}
				onClick={addToQueueHandler}>
				add to queue
			</Button>
			<Button
				enabled={enabled}
				onClick={playHandler}>
				play now
			</Button>
		</div>
	);
}

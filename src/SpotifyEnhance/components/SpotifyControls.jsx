import { React } from "@Api";


import SpotifyStore from "@Stores/SpotifyStore";
import { useStateFromStore } from "@Utils/Hooks";
import SpotifyEmbed from "./SpotifyEmbed";
import { addTrackToQueue, playTrack } from "../SpotifyWrapper";

export default ({ og, embed, trackId }) => {
	console.log(embed);
	const [renderOg, setRenderOg] = React.useState(false);
	const spotifySocket = useStateFromStore(SpotifyStore, () => SpotifyStore.getActiveSocketAndDevice()?.socket);

	const addToQueueHandler = () => addTrackToQueue(trackId);
	const playHandler = () => playTrack(trackId);












	
	return [
		renderOg ? (
			og
		) : (
			<SpotifyEmbed
				showControls={!!spotifySocket}
				embed={embed}
				trackId={trackId}
			/>
		),
		spotifySocket && (
			<div class="spotify-controls">
				<button onClick={addToQueueHandler}>add to queue</button>
				<button onClick={playHandler}>play now</button>
			</div>
		)
	];
};

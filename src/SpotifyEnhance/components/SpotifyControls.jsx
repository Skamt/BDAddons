import { React } from "@Api";
import { copy } from "@Utils";
import Toast from "@Utils/Toast";
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

	if (spotifyEmbed === "keep")
		return [
			og,
			<SpotifyControls
				url={embed.url}
				trackId={trackId}
				enabled={canDoStuff}
			/>
		];
	if (spotifyEmbed === "hide")
		return (
			<SpotifyControls
				url={embed.url}
				trackId={trackId}
				enabled={canDoStuff}
			/>
		);
};

function SpotifyControls({ url, trackId, enabled }) {
	const addToQueueHandler = () => addTrackToQueue(trackId);
	const playHandler = () => playTrack(trackId);
	const copyHandler = () => {
		copy(url);
		Toast.success("Link copied!");
	};

	return (
		enabled && (
			<div class="spotify-controls">
				<Button
					size={Button.Sizes.TINY}
					color={Button.Colors.GREEN}
					onClick={addToQueueHandler}>
					Add to queue
				</Button>
				<Button
					size={Button.Sizes.TINY}
					color={Button.Colors.GREEN}
					onClick={playHandler}>
					Listen
				</Button>
				<Button
					size={Button.Sizes.TINY}
					color={Button.Colors.GREEN}
					onClick={copyHandler}>
					Copy
				</Button>
			</div>
		)
	);
}

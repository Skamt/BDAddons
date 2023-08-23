import { React } from "@Api";
import Toast from "@Utils/Toast";
import Button from "@Components/Button";
import SpotifyStore from "@Stores/SpotifyStore";
import { useStateFromStore } from "@Utils/Hooks";
import { parseSpotifyUrl } from "../Utils.js";
import { addToQueue, listen, copySpotifyLink } from "../SpotifyWrapper";

export default ({ embed }) => {
	const { type, resourceId } = parseSpotifyUrl(embed.url);
	const spotifySocket = useStateFromStore(SpotifyStore, () => SpotifyStore.getActiveSocketAndDevice()?.socket);

	return (
		spotifySocket && (
			<div class="spotify-controls">
				
				{type !== "show" && (
					<ControlBtn
						value="listen"
						onClick={() => listen(type, resourceId, embed.rawTitle)}
					/>
				)}
				{(type === "track" || type === "episode") && (
					<ControlBtn
						value="add to queue"
						onClick={() => addToQueue(type, resourceId, embed.rawTitle)}
					/>
				)}
				<ControlBtn
					value="copy"
					onClick={() => copySpotifyLink(embed.url)}
				/>
			</div>
		)
	);
};

function ControlBtn({ value, onClick }) {
	return (
		<Button
			size={Button.Sizes.TINY}
			color={Button.Colors.GREEN}
			onClick={onClick}>
			{value}
		</Button>
	);
}
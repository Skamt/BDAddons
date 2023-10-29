import { React } from "@Api";
import Button from "@Components/Button";
import SpotifyStore from "@Stores/SpotifyStore";
import FluxHelpers from "@Modules/FluxHelpers";
import { parseSpotifyUrl } from "../Utils.js";
import SpotifyWrapper from "../SpotifyWrapper";


export default ({ embed }) => {
	const { url } = embed;
	const [type, id] = parseSpotifyUrl(url);
	const spotifySocket = FluxHelpers.useStateFromStores([SpotifyStore], () => SpotifyStore.getActiveSocketAndDevice()?.socket);
	if (!spotifySocket) return null;
	const listenBtn = type !== "show" && (
		<ControlBtn
			value="listen"
			onClick={() => SpotifyWrapper.Player.listen(type, id, embed.rawTitle)}
		/>
	);

	const queueBtn = (type === "track" || type === "episode") && (
		<ControlBtn
			value="add to queue"
			onClick={() => SpotifyWrapper.Player.queue(type, id, embed.rawTitle)}
		/>
	);

	const copyBtn = (
		<ControlBtn
			value="copy"
			onClick={() => SpotifyWrapper.Utils.copySpotifyLink(url)}
		/>
	);

	return (
		<div className="spotify-controls">
			{listenBtn}
			{queueBtn}
			{copyBtn}
		</div>
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

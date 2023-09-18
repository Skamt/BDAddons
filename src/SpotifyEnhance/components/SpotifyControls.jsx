import { React } from "@Api";
import Toast from "@Utils/Toast";
import Button from "@Components/Button";
import SpotifyStore from "@Stores/SpotifyStore";
import { useStateFromStore } from "@Utils/Hooks";
import { parseSpotifyUrl } from "../Utils.js";
import SpotifyWrapper from "../SpotifyWrapper";
import { ActionsEnum } from "../consts.js";

export default ({ embed }) => {
	const { url } = embed;
	const [type, id] = parseSpotifyUrl(url);
	const spotifySocket = useStateFromStore(SpotifyStore, () => SpotifyStore.getActiveSocketAndDevice()?.socket);
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
		<div class="spotify-controls">
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

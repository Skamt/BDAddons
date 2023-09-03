import { React } from "@Api";
import Toast from "@Utils/Toast";
import Button from "@Components/Button";
import SpotifyStore from "@Stores/SpotifyStore";
import { useStateFromStore } from "@Utils/Hooks";
import { parseSpotifyUrl } from "../Utils.js";
import { copySpotifyLink, listen, queue } from "../SpotifyWrapper";
import { ActionsEnum } from "../consts.js";

export default ({ embed }) => {
	const { url } = embed;
	const [type, id] = parseSpotifyUrl(url);
	const spotifySocket = useStateFromStore(SpotifyStore, () => SpotifyStore.getActiveSocketAndDevice()?.socket);
	if (!spotifySocket) return null;
	const listenBtn = type !== "show" && (
		<ControlBtn
			value="listen"
			onClick={() => listen(type, id, embed)}
		/>
	);

	const queueBtn = (type === "track" || type === "episode") && (
		<ControlBtn
			value="add to queue"
			onClick={() => queue(type, id, embed)}
		/>
	);

	const copyBtn = (
		<ControlBtn
			value="copy"
			onClick={() => copySpotifyLink(url)}
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

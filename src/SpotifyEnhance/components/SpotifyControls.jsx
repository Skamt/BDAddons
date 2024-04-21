import { React } from "@Api";
import Button from "@Components/Button";
// import FluxHelpers from "@Modules/FluxHelpers";
// import SpotifyStore from "@Stores/SpotifyStore";
// import SpotifyWrapper from "../SpotifyWrapper";

import SpotifyApi from "../SpotifyAPIWrapper";
import { Store } from "../Store";

export default ({ id, type, embed: { rawTitle, url } }) => {
	const isActive = Store(Store.selectors.isActive);
	if (!isActive) return null;

	const listenBtn = type !== "show" && (
		<ControlBtn
			value="play on spotify"
			onClick={() => SpotifyApi.listen(type, id, rawTitle)}
		/>
	);

	const queueBtn = (type === "track" || type === "episode") && (
		<ControlBtn
			value="add to queue"
			onClick={() => SpotifyApi.queue(type, id, rawTitle)}
		/>
	);

	return (
		<div className="spotify-no-embed-controls">
			{listenBtn}
			{queueBtn}
			<ControlBtn
				value="copy link"
				onClick={() => Store.copySpotifyLink(url)}
			/>
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

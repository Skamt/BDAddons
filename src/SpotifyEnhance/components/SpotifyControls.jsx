import { React } from "@Api";
import Button from "@Components/Button";

import SpotifyApi from "../SpotifyAPIWrapper";
import { Store } from "../Store";

export default ({ id, type, embed: { thumbnail, rawTitle, url } }) => {
	const isActive = Store(Store.selectors.isActive);
	if (!isActive) return null;

	const banner = thumbnail?.proxyURL || thumbnail?.url;

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
			{isActive && listenBtn}
			{isActive && queueBtn}
			<ControlBtn
				value="copy link"
				onClick={() => Store.Utils.copySpotifyLink(url)}
			/>
			<ControlBtn
				value="copy banner"
				onClick={() => Store.Utils.copySpotifyLink(banner)}
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

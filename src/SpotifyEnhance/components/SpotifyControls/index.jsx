import "./styles";
import { React } from "@Api";
import ControlBtn from "./ControlBtn";
import { Store } from "../../Store";

export default ({ id, type, embed: { thumbnail, rawTitle, url } }) => {
	const isActive = Store(Store.selectors.isActive);

	const listenBtn = type !== "show" && (
		<ControlBtn
			disabled={!isActive}
			value="play on spotify"
			onClick={() => Store.Api.listen(type, id, rawTitle)}
		/>
	);

	const queueBtn = (type === "track" || type === "episode") && (
		<ControlBtn
			disabled={!isActive}
			value="add to queue"
			onClick={() => Store.Api.queue(type, id, rawTitle)}
		/>
	);

	return (
		<div className="spotify-embed-plus">
			{listenBtn}
			{queueBtn}
			<ControlBtn
				value="copy link"
				onClick={() => Store.Utils.copySpotifyLink(url)}
			/>
			<ControlBtn
				value="copy banner"
				onClick={() => Store.Utils.copySpotifyLink(thumbnail?.url || thumbnail?.proxyURL)}
			/>
		</div>
	);
};

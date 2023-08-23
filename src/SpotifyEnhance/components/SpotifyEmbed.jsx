import { React } from "@Api";
import { copy } from "@Utils";
import Toast from "@Utils/Toast";
import { parseSpotifyUrl } from "../Utils.js";
import { addToQueue, listen, copySpotifyLink } from "../SpotifyWrapper";
import AddToQueueIcon from "@Components/AddToQueueIcon";
import CopyIcon from "@Components/CopyIcon";
import ListenIcon from "@Components/ListenIcon";
import SpotifyIcon from "@Components/SpotifyIcon";
import { useStateFromStore } from "@Utils/Hooks";
import SpotifyStore from "@Stores/SpotifyStore";

export default ({ embed }) => {
	const { thumbnail, rawTitle, rawDescription, url } = embed;
	const { type, resourceId } = parseSpotifyUrl(url);
	const spotifySocket = useStateFromStore(SpotifyStore, () => SpotifyStore.getActiveSocketAndDevice()?.socket);

	return (
		<div class="spotifyEmbed-Container">
			<div
				className="spotifyEmbed-thumbnail"
				style={{ "--thumbnail": `url(${thumbnail.url})` }}></div>
			<div className="spotifyEmbed-details">
				<div className="spotifyEmbed-info">
					<h2 className="spotifyEmbed-title">{rawTitle}</h2>
					<p className="spotifyEmbed-description">{rawDescription}</p>
				</div>
				{spotifySocket && (
					<div className="spotifyEmbed-controls">
						{type !== "show" && (
							<div
								onClick={() => listen(type, resourceId, rawTitle)}
								className="spotifyEmbed-btn spotifyEmbed-btn-listen">
								<ListenIcon />
							</div>
						)}
						{(type === "track" || type === "episode") && (
							<div
								onClick={() => addToQueue(type, resourceId, rawTitle)}
								className="spotifyEmbed-btn spotifyEmbed-btn-addToQueue">
								<AddToQueueIcon />
							</div>
						)}
						<div
							onClick={() => copySpotifyLink(url)}
							className="spotifyEmbed-btn spotifyEmbed-btn-copy">
							<CopyIcon />
						</div>
					</div>
				)}
			</div>
			<div className="spotifyEmbed-spotifyIcon">
				<SpotifyIcon onClick={() => window.open(url, "_blank")} />
			</div>
		</div>
	);
};

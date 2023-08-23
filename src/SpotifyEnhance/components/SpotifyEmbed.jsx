import { React } from "@Api";
import { copy } from "@Utils";
import Toast from "@Utils/Toast";
import { addToQueue, listen, copySpotifyLink } from "../SpotifyWrapper";
import AddToQueueIcon from "@Components/AddToQueueIcon";
import CopyIcon from "@Components/CopyIcon";
import ListenIcon from "@Components/ListenIcon";
import SpotifyIcon from "@Components/SpotifyIcon";

export default ({ enabled, embed, trackId }) => {
	const { thumbnail, rawTitle, rawDescription } = embed;

	return (
		<div class="spotifyEmbed-Container">
			<div
				className="spotifyEmbed-thumbnail"
				style={{ "--thumbnail": `url(${thumbnail.url})` }}></div>
			<div className="spotifyEmbed-details">
				<div className="spotifyEmbed-info">
					<h2 className="spotifyEmbed-title">{rawTitle}</h2>
					<p className="spotifyEmbed-description">{rawDescription.replace("· Song ·", "-")}</p>
				</div>
				{enabled && (
					<div className="spotifyEmbed-controls">
						<AddToQueue trackId={trackId} />
						<Play trackId={trackId} />
						<Copy url={embed.url} />
					</div>
				)}
			</div>
			<SpotifyIconButton url={embed.url} />
		</div>
	);
};

function SpotifyIconButton({ url }) {
	const clickHandler = () => window.open(url, "_blank");

	return (
		<div className="spotifyEmbed-spotifyIcon">
			<SpotifyIcon onClick={clickHandler} />
		</div>
	);
}

function AddToQueue({ trackId }) {
	const addToQueueHandler = () => addTrackToQueue(trackId);

	return (
		<div
			onClick={addToQueueHandler}
			className="spotifyEmbed-btn spotifyEmbed-btn-addToQueue">
			<AddToQueueIcon />
		</div>
	);
}

function Play({ trackId }) {
	const playHandler = () => playTrack(trackId);

	return (
		<div
			onClick={playHandler}
			className="spotifyEmbed-btn spotifyEmbed-btn-listen">
			<ListenIcon />
		</div>
	);
}

function Copy({ url }) {
	const copyHandler = () => {
		copy(url);
		Toast.success("Link copied!");
	};
	return (
		<div
			onClick={copyHandler}
			className="spotifyEmbed-btn spotifyEmbed-btn-copy">
			<CopyIcon />
		</div>
	);
}

import { React } from "@Api";
import { addTrackToQueue, playTrack } from "../SpotifyWrapper";
import AddToQueueIcon from "@Components/AddToQueueIcon";
import CopyIcon from "@Components/CopyIcon";
import ListenIcon from "@Components/ListenIcon";
import SpotifyIcon from "@Components/SpotifyIcon";

export default ({ showControls, embed, trackId }) => {
	const { thumbnail, rawTitle, rawDescription } = embed;

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
				{showControls && (
					<div className="spotifyEmbed-controls">
						<AddToQueue trackId={trackId} />
						<Play trackId={trackId} />
						<Copy />
					</div>
				)}
			</div>
			<div className="spotifyEmbed-spotifyIcon">
				<SpotifyIcon />
			</div>
		</div>
	);
};

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

function Copy() {
	return (
		<div className="spotifyEmbed-btn spotifyEmbed-btn-copy">
			<CopyIcon />
		</div>
	);
}

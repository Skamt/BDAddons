import { React } from "@Api";
import { copy } from "@Utils";
import Toast from "@Utils/Toast";
import { parseSpotifyUrl } from "../Utils.js";
import { doAction, copySpotifyLink } from "../SpotifyWrapper";
import { ActionsEnum } from "../consts.js";
import AddToQueueIcon from "@Components/AddToQueueIcon";
import CopyIcon from "@Components/CopyIcon";
import ListenIcon from "@Components/ListenIcon";
import SpotifyIcon from "@Components/SpotifyIcon";
import { useStateFromStore } from "@Utils/Hooks";
import SpotifyStore from "@Stores/SpotifyStore";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import Tooltip from "@Components/Tooltip";

export default ({ embed }) => {
	const { thumbnail, rawTitle, rawDescription, url } = embed;
	const [type, id] = parseSpotifyUrl(url);
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
				<div className="spotifyEmbed-controls">
					{spotifySocket && [
						type !== "show" && (
							<Listen
								type={type}
								id={id}
								embed={embed}
							/>
						),
						(type === "track" || type === "episode") && (
							<AddToQueue
								type={type}
								id={id}
								embed={embed}
							/>
						)
					]}
					<Tooltip
						note="Copy link"
						position="top">
						<div
							onClick={() => copySpotifyLink(url)}
							className="spotifyEmbed-btn spotifyEmbed-btn-copy">
							<CopyIcon />
						</div>
					</Tooltip>

					<Timebar
						id={id}
						embed={embed}
					/>
				</div>
			</div>
			<Tooltip
				note="Play on Spotify"
				position="top">
				<div
					onClick={() => window.open(url, "_blank")}
					className="spotifyEmbed-spotifyIcon">
					<SpotifyIcon />
				</div>
			</Tooltip>
		</div>
	);
};

function Listen({ type, id, embed }) {
	const clickHandler = () => {
		console.log(embed);
		doAction(ActionsEnum.LISTEN, type, id)
			.then(() => {
				Toast.success(`Playing ${type} ${embed.rawTitle}`);
			})
			.catch(() => {
				Toast.error(`Could not play ${type} ${embed.rawTitle}`);
			});
	};
	return (
		<Tooltip
			note={`Play ${type}`}
			position="top">
			<div
				onClick={clickHandler}
				className="spotifyEmbed-btn spotifyEmbed-btn-listen">
				<ListenIcon />
			</div>
		</Tooltip>
	);
}

function AddToQueue({ type, id, embed }) {
	const clickHandler = () => {
		doAction(ActionsEnum.QUEUE, type, id)
			.then(() => {
				Toast.success(`Added ${type} ${embed.rawTitle} to the queue`);
			})
			.catch(() => {
				Toast.error(`Could not add ${type} ${embed.rawTitle} to the queue`);
			});
	};
	return (
		<Tooltip
			note={`Add ${type} to queue`}
			position="top">
			<div
				onClick={clickHandler}
				className="spotifyEmbed-btn spotifyEmbed-btn-addToQueue">
				<AddToQueueIcon />
			</div>
		</Tooltip>
	);
}

const Bar = getModule(a => a.prototype.render && a.defaultProps.themed === false);

function Timebar({ id }) {
	const activity = useStateFromStore(SpotifyStore, () => SpotifyStore.getActivity());
	if (!activity || activity.sync_id !== id) return null;
	console.log(activity);
	return (
		<div className="spotifyEmbed-timeBar">
			<Bar
				{...activity.timestamps}
				className="timeBarUserPopoutV2-32DL06"
			/>
		</div>
	);
}

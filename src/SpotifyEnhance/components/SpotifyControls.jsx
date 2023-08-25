import { React } from "@Api";
import Toast from "@Utils/Toast";
import Button from "@Components/Button";
import SpotifyStore from "@Stores/SpotifyStore";
import { useStateFromStore } from "@Utils/Hooks";
import { parseSpotifyUrl } from "../Utils.js";
import { doAction, copySpotifyLink } from "../SpotifyWrapper";
import { ActionsEnum } from "../consts.js";

export default ({ embed }) => {
	const { url } = embed;
	const [type, id] = parseSpotifyUrl(url);
	const spotifySocket = useStateFromStore(SpotifyStore, () => SpotifyStore.getActiveSocketAndDevice()?.socket);

	return (
		spotifySocket && (
			<div class="spotify-controls">
				{type !== "show" && (
					<Listen
						type={type}
						id={id}
						embed={embed}
					/>
				)}
				{(type === "track" || type === "episode") && (
					<AddToQueue
						type={type}
						id={id}
						embed={embed}
					/>
				)}
				<ControlBtn
					value="copy"
					onClick={() => copySpotifyLink(url)}
				/>
			</div>
		)
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

function Listen({ type, id, embed }) {
	const clickHandler = () => {
		doAction(ActionsEnum.LISTEN, type, id)
			.then(() => {
				Toast.success(`Playing ${type} ${embed.rawTitle}`);
			})
			.catch(() => {
				Toast.error(`Could not play ${type} ${embed.rawTitle}`);
			});
	};
	return (
		<ControlBtn
			value="listen"
			onClick={clickHandler}
		/>
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
		<ControlBtn
			value="add to queue"
			onClick={clickHandler}
		/>
	);
}

import { React } from "@Api";
import SpotifyAPI from "@Utils/SpotifyAPI";
import Toast from "@Utils/Toast";
import SpotifyStore from "@Stores/SpotifyStore";
import { useStateFromStore } from "@Utils/Hooks";

const refreshToken = getModule(Filters.byStrings("CONNECTION_ACCESS_TOKEN"), { searchExports: true });

async function requestHandler({ action, onSucess, onError }) {
	let b = false;
	while (true) {
		try {
			await action();
			onSucess();
			break;
		} catch ({error}) {
			if (error.status !== 401 || b) return onError();
			const data = await refreshToken(SpotifyAPI.accountId);
			SpotifyAPI.token = data.body.access_token;
			b = true;
			continue;
		}
	}
}

export default ({ og, embed, trackId }) => {
	console.log(embed);
	const [renderOg, setRenderOg] = React.useState(true);
	const spotifySocket = useStateFromStore(SpotifyStore, () => SpotifyStore.getPlayableComputerDevices()[0]?.socket);

	const addToQueueHandler = () => {
		requestHandler({
			action: () => SpotifyAPI.addToQueue(`spotify:track:${trackId}`),
			onSucess: () => Toast.success(`Added [${embed.rawDescription}] to queue`),
			onError: () => Toast.error(`Could not add [${trackId}] to queue`)
		});
	};

	const playHandler = () => {
		requestHandler({
			action: () => SpotifyAPI.playTrack([`spotify:track:${trackId}`]),
			onSucess: () => Toast.success(`Playing [${embed.rawDescription}]`),
			onError: () => Toast.error(`Could not play [${trackId}]`)
		});
	};

	return [
		renderOg ? og : null,
		spotifySocket && (
			<div class="spotify-controls">
				<button onClick={addToQueueHandler}>add to queue</button>
				<button onClick={playHandler}>play now</button>
			</div>
		)
	];
};

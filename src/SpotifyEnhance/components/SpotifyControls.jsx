import { React } from "@Api";
import Toast from "@Utils/Toast";
import Button from "@Components/Button";
import SpotifyStore from "@Stores/SpotifyStore";
import { useStateFromStore } from "@Utils/Hooks";
import { parseSpotifyUrl } from "../Utils.js";
import { addTrackToQueue, addEpisodeToQueue, playTrack, playArtist, playPlaylist, playAlbum, playEpisode, copySpotifyLink } from "../SpotifyWrapper";

export default ({ embed }) => {
	const { type, resourceId } = parseSpotifyUrl(embed.url);
	const spotifySocket = useStateFromStore(SpotifyStore, () => SpotifyStore.getActiveSocketAndDevice()?.socket);

	const canDoStuff = !!spotifySocket;
	const Comp = types[type] || null;
	return (
		<div class="spotify-controls">
			{canDoStuff && (
				<Comp
					id={resourceId}
					url={embed.url}
				/>
			)}
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

function Show({ url }) {
	return [
		<ControlBtn
			value="copy"
			onClick={() => copySpotifyLink(url)}
		/>
	];
}

function Track({ url, id }) {
	return [
		<ControlBtn
			value="Add to queue"
			onClick={() => addTrackToQueue(id)}
		/>,
		<ControlBtn
			value="Listen"
			onClick={() => playTrack(id)}
		/>,
		<ControlBtn
			value="copy"
			onClick={() => copySpotifyLink(url)}
		/>
	];
}

function Episode({ url, id }) {
	return [
		<ControlBtn
			value="Add to queue"
			onClick={() => addEpisodeToQueue(id)}
		/>,
		<ControlBtn
			value="Listen"
			onClick={() => playEpisode(id)}
		/>,
		<ControlBtn
			value="copy"
			onClick={() => copySpotifyLink(url)}
		/>
	];
}

function Playlist({ url, id }) {
	return [
		<ControlBtn
			value="Listen"
			onClick={() => playPlaylist(id)}
		/>,
		<ControlBtn
			value="copy"
			onClick={() => copySpotifyLink(url)}
		/>
	];
}

function Album({ url, id }) {
	return [
		<ControlBtn
			value="Listen"
			onClick={() => playAlbum(id)}
		/>,
		<ControlBtn
			value="copy"
			onClick={() => copySpotifyLink(url)}
		/>
	];
}

function Artist({ url, id }) {
	return [
		<ControlBtn
			value="Listen"
			onClick={() => playArtist(id)}
		/>,
		<ControlBtn
			value="copy"
			onClick={() => copySpotifyLink(url)}
		/>
	];
}

const types = {
	episode: Episode,
	track: Track,
	playlist: Playlist,
	album: Album,
	artist: Artist,
	show: Show
};

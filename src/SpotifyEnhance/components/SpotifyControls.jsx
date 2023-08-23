import { React } from "@Api";
import Toast from "@Utils/Toast";
import Button from "@Components/Button";
import SpotifyStore from "@Stores/SpotifyStore";
import { useStateFromStore } from "@Utils/Hooks";
import { parseSpotifyUrl } from "../Utils.js";
import { addToQueue, listen, copySpotifyLink } from "../SpotifyWrapper";

export default ({ embed }) => {
	const { type, resourceId } = parseSpotifyUrl(embed.url);
	const spotifySocket = useStateFromStore(SpotifyStore, () => SpotifyStore.getActiveSocketAndDevice()?.socket);

	return (
		!!spotifySocket && (
			<div class="spotify-controls">
				
				{type !== "show" && (
					<ControlBtn
						value="listen"
						onClick={() => listen(type, resourceId, embed.rawTitle)}
					/>
				)}
				{(type === "track" || type === "episode") && (
					<ControlBtn
						value="add to queue"
						onClick={() => addToQueue(type, resourceId, embed.rawTitle)}
					/>
				)}
				<ControlBtn
					value="copy"
					onClick={() => copySpotifyLink(embed.url)}
				/>
			</div>
		)
	);
};

// const types = {
// 	episode: [
// 		{ action: listen, label: "listen" },
// 		{ action: addToQueue, label: "add episode to queue" }
// 	],
// 	track: [
// 		{ action: listen, label: "listen" },
// 		{ action: addToQueue, label: "add track to queue" }
// 	],
// 	playlist: [{ action: listen, label: "listen" }],
// 	album: [{ action: listen, label: "listen" }],
// 	artist: [{ action: listen, label: "listen" }]
// };

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

// function Switch({ type, id, url, embed }) {
// 	const target = types[type] || [];
// 	console.log(embed);
// 	return [
// 		...target.map(({ label, action }) => (
// 			<ControlBtn
// 				value={label}
// 				onClick={() => action(id, embed.rawTitle)}
// 			/>
// 		)),
// 		<ControlBtn
// 			value="copy"
// 			onClick={() => copySpotifyLink(url)}
// 		/>
// 	];
// }

// const types = {
// 	episode: Episode,
// 	track: Track,
// 	playlist: Playlist,
// 	album: Album,
// 	artist: Artist,
// 	show: Show
// };

// function CopyBtn({ content }) {
// 	return (
// 		<ControlBtn
// 			value="copy"
// 			onClick={() => copySpotifyLink(content)}
// 		/>
// 	);
// }

// function ListenBtn({ onClick }) {
// 	return (
// 		<ControlBtn
// 			value="Listen"
// 			onClick={onClick}
// 		/>
// 	);
// }

// function AddToQueueBtn({ onClick }) {
// 	return (
// 		<ControlBtn
// 			value="Add to queue"
// 			onClick={onClick}
// 		/>
// 	);
// }

// function Show({ url }) {
// 	return <CopyBtn content={url} />;
// }

// function Track({ url, id }) {
// 	return (
// 		<>
// 			<ListenBtn onClick={() => playTrack(id)} />
// 			<AddToQueueBtn onClick={() => addTrackToQueue(id)} />
// 			<CopyBtn content={url} />
// 		</>
// 	);
// }

// function Episode({ url, id }) {
// 	return (
// 		<>
// 			<ListenBtn onClick={() => playEpisode(id)} />
// 			<AddToQueueBtn onClick={() => addEpisodeToQueue(id)} />
// 			<CopyBtn content={url} />
// 		</>
// 	);
// }

// function Playlist({ url, id }) {
// 	return [
// 		<ControlBtn
// 			value="Listen"
// 			onClick={() => playPlaylist(id)}
// 		/>,
// 		<ControlBtn
// 			value="copy"
// 			onClick={() => copySpotifyLink(url)}
// 		/>
// 	];
// }

// function Album({ url, id }) {
// 	return [
// 		<ControlBtn
// 			value="Listen"
// 			onClick={() => playAlbum(id)}
// 		/>,
// 		<ControlBtn
// 			value="copy"
// 			onClick={() => copySpotifyLink(url)}
// 		/>
// 	];
// }

// function Artist({ url, id }) {
// 	return [
// 		<ControlBtn
// 			value="Listen"
// 			onClick={() => playArtist(id)}
// 		/>,
// 		<ControlBtn
// 			value="copy"
// 			onClick={() => copySpotifyLink(url)}
// 		/>
// 	];
// }

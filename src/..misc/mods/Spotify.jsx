import { getModule } from "@Webpack";
import Logger from "@Utils/Logger";
import { Disposable } from "@Utils";
import { Patcher, React } from "@Api";
import SpotifyAPI from "@Utils/SpotifyAPI";
import PlayIcon from "@Components/PlayIcon";
import PauseIcon from "@Components/PauseIcon";
import AddToQueueIcon from "@Components/AddToQueueIcon";
import FavoriteIcon from "@Components/FavoriteIcon";
import CopyIcon from "@Components/CopyIcon";
import ListenIcon from "@Components/ListenIcon";
import SpotifyIcon from "@Components/SpotifyIcon";

import Toast from "@Utils/Toast";
import SpotifyStore from "@Stores/SpotifyStore";
import UserStore from "@Stores/UserStore";
import SelectedChannelStore from "@Stores/SelectedChannelStore";
import ChannelStore from "@Stores/ChannelStore";
import { sendMessageDirectly, insertText } from "@Utils/Messages";

function parseSpotifyUrl(url) {
	if (typeof url !== "string") return undefined;
	const [, type, id] = url.match(/\/(\w+)\/(\w+)/);
	return { type, id };
}

export default class Spotify extends Disposable {
	Init() {
		this.patches = [patchEmbed(), patchActivity()];
	}
}

function patchEmbed() {
	const EmbedComponent = getModule(a => a.prototype.getSpoilerStyles);
	if (EmbedComponent)
		return Patcher.after(EmbedComponent.prototype, "render", (_, args, ret) => {
			const { props } = _;
			console.log(_);
			if (props.embed?.provider?.name !== "Spotify") return;
			if (props.embed?.type === "article") return;
			const { type, id } = parseSpotifyUrl(props.embed.url);
			if (type !== "track") return;
			const socketAndDevice = SpotifyStore.getActiveSocketAndDevice();
			if (!socketAndDevice) return;
			SpotifyAPI.token = socketAndDevice?.socket.accessToken;
			return [
				ret,
				<ErrorBoundary
					id="SpotifyEmbed"
					plugin={config.info.name}>
					<SpotifyControls
						embed={props.embed}
						id={id}
					/>
				</ErrorBoundary>
			];
		});
	else Logger.patch("Spotify-EmbedComponent");
	return () => {};
}

function patchActivity() {
	const ActivityComponent = getModule(a => a.prototype.isStreamerOnTypeActivityFeed);
	if (ActivityComponent)
		return Patcher.after(ActivityComponent.prototype, "render", (_, args, ret) => {
			const { user } = _.props;
			const currentUser = UserStore.getCurrentUser();
			if (user.id !== currentUser.id) return;

			ret?.props.children?.push?.(
				<button
					onClick={() => {
							const selectedChannel = SelectedChannelStore.getCurrentlySelectedChannelId();
							if (!selectedChannel) return;
							const channel = ChannelStore.getChannel("1056626842943107122");
							const track = SpotifyStore.getTrack();
							const content = `https://open.spotify.com/track/${track.id}`;
						try {
							sendMessageDirectly(channel, content);
						} catch {
							Toast.error("Could not send directly.");
							insertText(content);
						}
					}}>
					{"Share"}
				</button>
			);
		});
	else Logger.patch("Spotify-ActivityComponent");
	return () => {};
}

function SpotifyControls({ embed, id }) {
	const { thumbnail, rawTitle, rawDescription } = embed;
	const [playing, setplaying] = React.useState(false);

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
					<Favorite />
					<AddToQueue trackId={id} />
					<Listen trackId={id} />
					<Copy />
					{!playing ? <Play /> : <Pause />}
				</div>
			</div>
			<div className="spotifyEmbed-spotifyIcon">
				<SpotifyIcon />
			</div>
		</div>
	);
}

function Play() {
	return (
		<div className="spotifyEmbed-btn spotifyEmbed-btn-play">
			<PlayIcon />
		</div>
	);
}

function Pause() {
	return (
		<div className="spotifyEmbed-btn spotifyEmbed-btn-pause">
			<PauseIcon />
		</div>
	);
}

function Favorite() {
	return (
		<div className="spotifyEmbed-btn spotifyEmbed-btn-favorite">
			<FavoriteIcon />
		</div>
	);
}

function AddToQueue({ trackId }) {
	const addToQueueHandler = () => {
		SpotifyAPI.addToQueue(`spotify:track:${trackId}`);
	};
	return (
		<div
			onClick={addToQueueHandler}
			className="spotifyEmbed-btn spotifyEmbed-btn-addToQueue">
			<AddToQueueIcon />
		</div>
	);
}

function Listen({ trackId }) {
	const playHandler = () => {
		SpotifyAPI.playTrack([`spotify:track:${trackId}`]);
	};

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

class ErrorBoundary extends React.Component {
	state = { hasError: false, error: null, info: null };

	componentDidCatch(error, info) {
		this.setState({ error, info, hasError: true });
		const errorMessage = `\n\t${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
		console.error(`%c[${this.props.plugin}] %cthrew an exception at %c[${this.props.id}]\n`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) return this.props.fallback;
			else {
				return (
					<div style={{ background: "#292c2c", padding: "20px", borderRadius: "10px" }}>
						<b style={{ color: "#e0e1e5" }}>
							An error has occured while rendering <span style={{ color: "orange" }}>{this.props.id}</span>
						</b>
					</div>
				);
			}
		} else return this.props.children;
	}
}

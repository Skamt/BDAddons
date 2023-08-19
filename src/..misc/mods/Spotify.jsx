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




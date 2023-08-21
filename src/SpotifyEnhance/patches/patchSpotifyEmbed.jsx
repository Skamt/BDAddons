import Logger from "@Utils/Logger";
import { React, Patcher } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";
import SpotifyControls from "../components/SpotifyControls";

function parseSpotifyUrl(url) {
	if (typeof url !== "string") return undefined;
	const [, type, trackId] = url.match(/\/(\w+)\/(\w+)/);
	return { type, trackId };
}

export default () => {
	const EmbedComponent = getModule(a => a.prototype.getSpoilerStyles);
	if (EmbedComponent)
		Patcher.after(EmbedComponent.prototype, "render", (_, args, ret) => {
			const { props } = _;
			if (props.embed?.provider?.name !== "Spotify") return;
			console.log(props.embed)
			if (props.embed?.type === "article") return;
			const { type, trackId } = parseSpotifyUrl(props.embed.url);
			if (type !== "track") return;

			return (
				<ErrorBoundary
					id="SpotifyEmbed"
					plugin={config.info.name}>
					<SpotifyControls
						og={ret}
						embed={props.embed}
						trackId={trackId}
					/>
				</ErrorBoundary>
			);
		});
	else Logger.patch("SpotifyEmbed");
};
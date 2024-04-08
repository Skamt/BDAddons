import Logger from "@Utils/Logger";
import { React, Patcher } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";
import EmbedComponent from "@Modules/EmbedComponent";
import SpotifyEmbedWrapper from "../components/SpotifyEmbedWrapper";
import { parseSpotifyUrl } from "../Utils";

const ALLOWD_TYPES = ["track", "playlist", "album", "show", "episode"];

export default () => {
	if (EmbedComponent)
		Patcher.after(EmbedComponent.prototype, "render", ({ props: { embed } }, args, ret) => {
			if (embed?.provider?.name !== "Spotify") return;

			const [type, id] = parseSpotifyUrl(embed.url) || [];
			if (!ALLOWD_TYPES.includes(type)) {
				Logger.log(`Spotify ${type}`, embed.url);
				return;
			}

			return (
				<ErrorBoundary
					id="SpotifyEmbed"
					plugin={config.info.name}
					fallback={ret}>
					<SpotifyEmbedWrapper
						id={id}
						type={type}
						embedComponent={ret}
						embedObject={embed}
					/>
				</ErrorBoundary>
			);
		});
	else Logger.patch("SpotifyEmbed");
};

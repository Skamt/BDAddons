import Logger from "@Utils/Logger";
import { React, Patcher } from "@Api";
import { getModule, Filters } from "@Webpack";
import ErrorBoundary from "@Components/ErrorBoundary";
import SpotifyEmbedWrapper from "../components/SpotifyEmbedWrapper";
import { parseSpotifyUrl } from "../Utils";

const ALLOWD_TYPES = ["track", "playlist", "album", "show", "episode"];
const SpotifyEmbed = getModule(Filters.byStrings("open.spotify.com", "/playlist/"), { defaultExport: false });

export default () => {
	if (SpotifyEmbed)
		Patcher.after(SpotifyEmbed, "default", (_, [{ embed }], ret) => {
			const [type, id] = parseSpotifyUrl(embed.url) || [];
			if (!ALLOWD_TYPES.includes(type)) {
				Logger.log(`Spotify ${type}`, embed.url);
				return;
			}

			return (
				<ErrorBoundary
					id="SpotifyEmbed"
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

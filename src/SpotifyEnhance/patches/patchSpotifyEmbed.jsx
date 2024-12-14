import Logger from "@Utils/Logger";
import { React, Patcher } from "@Api";
import { getModule, Filters } from "@Webpack";
import ErrorBoundary from "@Components/ErrorBoundary";
import SpotifyEmbedWrapper from "../components/SpotifyEmbedWrapper";
import { parseSpotifyUrl } from "../Utils";

const ALLOWD_TYPES = ["track", "artist", "playlist", "album", "show", "episode"];
const SpotifyEmbed = getModule(Filters.byStrings("iframe", "playlist", "track"), { defaultExport: false });

export default () => {
	if (!SpotifyEmbed) return Logger.patch("SpotifyEmbed");
	Patcher.after(SpotifyEmbed, "Z", (_, [{ embed }], ret) => {
		const [id, type] = parseSpotifyUrl(embed.url) || [];
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
};

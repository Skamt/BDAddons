import Logger from "@Utils/Logger";
import { React, Patcher } from "@Api";
import { getModule, Filters } from "@Webpack";
import ErrorBoundary from "@Components/ErrorBoundary";
import SpotifyEmbedWrapper from "../components/SpotifyEmbedWrapper";
import { parseSpotifyUrl } from "../Utils";
import { ALLOWD_TYPES } from "../consts";
import { MessageStateContext } from "./patchMessageComponentAccessories";

const SpotifyEmbed = getModule(Filters.byStrings("iframe", "playlist", "track"), { defaultExport: false });

export default () => {
	if (!SpotifyEmbed) return Logger.patchError("SpotifyEmbed");

	Patcher.after(SpotifyEmbed, "Z", (_, [{ embed }], ret) => {
		const messageState = React.useContext(MessageStateContext);
		if (messageState !== "SENT") return null;
		const [id, type] = parseSpotifyUrl(embed.url) || [];
		if (!ALLOWD_TYPES.includes(type)) return;

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

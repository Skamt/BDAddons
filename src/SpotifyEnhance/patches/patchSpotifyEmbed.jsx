import Logger from "@Utils/Logger";
import { React, Patcher } from "@Api";
import { getDeclarationAndKey, Filters } from "@Webpack";
import ErrorBoundary from "@Components/ErrorBoundary";
import SpotifyEmbedWrapper from "@/components/SpotifyEmbedWrapper";
import { parseSpotifyUrl } from "@/Utils";
import { ALLOWD_TYPES } from "@/consts";
import { MessageStateContext } from "./patchMessageComponentAccessories";
import Plugin from "@common/Plugin";

const SpotifyEmbed = getDeclarationAndKey(Filters.bySource("iframe", "playlist", "track"), Filters.byStrings("iframe", "playlist", "track"));

Plugin.onStart(() => {
	const { module, key } = SpotifyEmbed;
	if (!module || !key) return Logger.patchError("SpotifyEmbed");

	Patcher.after(module, key, (_, [{ embed }], ret) => {
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
});

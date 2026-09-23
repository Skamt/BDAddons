import React from "@React";
import { after } from "@common/Patcher";
import { getDeclarationAndKey, Filters } from "@Webpack";
import ErrorBoundary from "@Components/ErrorBoundary";
import SpotifyEmbedWrapper from "@/components/SpotifyEmbedWrapper";
import { parseSpotifyUrl } from "@/utils";
import { ALLOWD_TYPES } from "@/consts";
import { MessageStateContext } from "./patchMessageComponentAccessories";
import Plugin from "@common/Plugin";

const SpotifyEmbed = getDeclarationAndKey(Filters.bySource("iframe", "playlist", "track"), Filters.byStrings("iframe", "playlist", "track"));

Plugin.onStart(() => {
	after(...SpotifyEmbed, ({ args: [{ embed }], ret }) => {
		const messageState = React.use(MessageStateContext);
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

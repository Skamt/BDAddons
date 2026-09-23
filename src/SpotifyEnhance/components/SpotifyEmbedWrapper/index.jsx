import React from "@React";
import { EmbedStyleEnum } from "@/consts.js";
import Settings from "@Utils/Settings";
import SpotifyEmbed, { SpotifyEmbedControls } from "../SpotifyEmbed";

export default function SpotifyEmbedWrapper({ id, type, embedObject, embedComponent }) {
	const spotifyEmbed = Settings(Settings.selectors.spotifyEmbed);

	switch (spotifyEmbed) {
		case EmbedStyleEnum.KEEP:
			return [
				embedComponent,
				<SpotifyEmbedControls id={id} type={type} embed={embedObject} />,
			];
		case EmbedStyleEnum.REPLACE:
			return <SpotifyEmbed id={id} type={type} />;
		case EmbedStyleEnum.HIDE:
			return <SpotifyEmbedControls id={id} type={type} embed={embedObject} />;
	}
	return embedComponent;
}

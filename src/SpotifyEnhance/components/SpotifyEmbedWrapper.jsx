import { React } from "@Api";
import { EmbedStyleEnum } from "../consts.js";
import Settings from "@Utils/Settings";
import SpotifyControls from "./SpotifyControls";
import SpotifyEmbed from "./SpotifyEmbed";

export default function SpotifyEmbedWrapper({ id, type, embedObject, embedComponent }) {
	const spotifyEmbed = Settings(Settings.selectors.spotifyEmbed);
	switch (spotifyEmbed) {
		case EmbedStyleEnum.KEEP:
			return [
				embedComponent,
				// eslint-disable-next-line react/jsx-key
				<SpotifyControls
					id={id}
					type={type}
					embed={embedObject}
				/>
			];
		case EmbedStyleEnum.REPLACE:
			return (
				<SpotifyEmbed
					id={id}
					type={type}
					embed={embedObject}
				/>
			);
		case EmbedStyleEnum.HIDE:
			return (
				<SpotifyControls
					id={id}
					type={type}
					embed={embedObject}
				/>
			);
	}
	return embedComponent;
}

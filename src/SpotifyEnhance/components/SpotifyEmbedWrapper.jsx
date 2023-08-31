import { React } from "@Api";
import { EmbedStyleEnum } from "../consts.js";
import { useSettings } from "@Utils/Hooks";
import SpotifyControls from "./SpotifyControls";
import SpotifyEmbed from "./SpotifyEmbed";

export default function SpotifyEmbedWrapper({ embedObject, embedComponent }) {
	const spotifyEmbed = useSettings("spotifyEmbed");
	switch (EmbedStyleEnum[spotifyEmbed]) {
		case EmbedStyleEnum.KEEP:
			return [embedComponent, <SpotifyControls embed={embedObject} />];
		case EmbedStyleEnum.REPLACE:
			return <SpotifyEmbed embed={embedObject} />;
		case EmbedStyleEnum.HIDE:
			return <SpotifyControls embed={embedObject} />;
		default:
			return embedComponent;
	}
}

import Logger from "@Utils/Logger";
import { React, Patcher } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";
import SpotifyEmbedWrapper from "../components/SpotifyEmbedWrapper";


export default () => {
	const EmbedComponent = getModule(a => a.prototype.getSpoilerStyles);
	if (EmbedComponent)
		Patcher.after(EmbedComponent.prototype, "render", (_, args, ret) => {
			const { props } = _;
			// console.log(props.embed);

			if (props.embed?.provider?.name !== "Spotify") return;
			if (props.embed?.type === "article"){
				Logger.log("Spotify article", props.embed.url);
				return;
			}
			
			return (
				<ErrorBoundary
					id="SpotifyEmbed"
					plugin={config.info.name}
					fallback={ret}>
					<SpotifyEmbedWrapper
						embedComponent={ret}
						embedObject={props.embed}
					/>
				</ErrorBoundary>
			);
		});
	else Logger.patch("SpotifyEmbed");
};
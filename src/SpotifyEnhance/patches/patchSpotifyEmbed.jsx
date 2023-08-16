import Logger from "@Utils/Logger";

function parseSpotifyUrl(url) {
	if (typeof url !== "string") return undefined;
	const [, type, id] = url.match(/\/(\w+)\/(\w+)/);
	return { type, id };
}

export default () => {
	const EmbedComponent = getModule(a => a.prototype.getSpoilerStyles);
	if (EmbedComponent)
		Patcher.after(EmbedComponent.prototype, "render", (_, args, ret) => {
			console.log(_);
			const { props } = _;
			if (props.embed?.provider?.name !== "Spotify") return;
			if (props.embed?.type === "article") return;
			const { type, id } = parseSpotifyUrl(props.embed.url);
			if (type !== "track") return;

			return (
				<ErrorBoundary
					id="SpotifyEmbed"
					plugin={config.info.name}>
					<SpotifyControls
						og={ret}
						embed={props.embed}
						id={id}
					/>
				</ErrorBoundary>
			);
		});
	else Logger.patch("SpotifyEmbed");
};

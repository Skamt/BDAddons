import { Filters, getBySource } from "@Webpack";
import { React, ReactDOM } from "@Api";
import SpotifyPlayer from "./components/SpotifyPlayer";
import ErrorBoundary from "@Components/ErrorBoundary";
import Settings from "@Utils/Settings";
import { shallow } from "@Utils";
import { PlayerPlaceEnum } from "./consts.js";

const pipContainer = Object.assign(document.createElement("div"), { className: "pipContainer" });

export default {
	init() {
		document.body.appendChild(pipContainer);
		this.root = ReactDOM.createRoot(pipContainer);
		this.root.render(
			<ErrorBoundary>
				<PipContainer />
			</ErrorBoundary>
		);
	},
	dispose() {
		this.root.unmount();
		pipContainer.remove();
	}
};

const Draggable = getBySource("edgeOffsetBottom", "defaultPosition")?.Z;

function PipContainer() {
	const [player, spotifyPlayerPlace] = Settings(_ => [_.player, _.spotifyPlayerPlace], shallow);
	if (spotifyPlayerPlace !== PlayerPlaceEnum.PIP) return;
	if (!player) return;
	return (
		<Draggable>
			<SpotifyPlayer />
		</Draggable>
	);
}

import { Filters, getBySource } from "@Webpack";
import { React, ReactDOM } from "@Api";
import SpotifyPlayer from "./components/SpotifyPlayer";
import Settings from "@Utils/Settings";
import { shallow } from "@Utils";
import { PlayerPlaceEnum } from "./consts.js";

export default new (class {
	pipContainer = Object.assign(document.createElement("div"), { className: "pipContainer" });

	init() {
		document.body.appendChild(this.pipContainer);
		ReactDOM.render(<PipContainer />, this.pipContainer);
	}

	dispose() {
		ReactDOM.unmountComponentAtNode(this.pipContainer);
		this.pipContainer.remove();
	}
})();

const Draggable = getBySource(Filters.byStrings("edgeOffsetBottom", "defaultPosition"))?.Z;

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

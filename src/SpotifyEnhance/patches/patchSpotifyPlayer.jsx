import { Patcher, React } from "@Api";
import { getFluxContainer } from "../Utils";
import SpotifyPlayer from "../components/SpotifyPlayer";
import Logger from "@Utils/Logger";
import ErrorBoundary from "@Components/ErrorBoundary";

export default () => {
	const fluxContainer = getFluxContainer();
	if (!fluxContainer) return Logger.patch("SpotifyPlayer");
	Patcher.after(fluxContainer.type.prototype, "render", (_, __, ret) => {
		return [
			<ErrorBoundary
				id="SpotifyPlayer"
				plugin={config.info.name}>
				<SpotifyPlayer />
			</ErrorBoundary>,
			ret
		];
	});
	fluxContainer.stateNode.forceUpdate();
};

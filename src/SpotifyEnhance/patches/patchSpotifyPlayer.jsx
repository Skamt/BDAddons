import { Patcher, React } from "@Api";
import { getFluxContainer } from "../Utils";
import SpotifyPlayer from "../components/SpotifyPlayer";
import Logger from "@Utils/Logger";
import ErrorBoundary from "@Components/ErrorBoundary";

export default async () => {
	const fluxContainer = await getFluxContainer();
	if (!fluxContainer) return Logger.patch("SpotifyPlayer");
	Patcher.after(fluxContainer.type.prototype, "render", (_, __, ret) => {
		return [
			// eslint-disable-next-line react/jsx-key
			<ErrorBoundary id="SpotifyPlayer">
				<SpotifyPlayer />
			</ErrorBoundary>,
			ret
		];
	});
	fluxContainer.stateNode.forceUpdate();
};

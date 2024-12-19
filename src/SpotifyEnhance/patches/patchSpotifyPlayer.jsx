import { Patcher, React } from "@Api";
import { getFluxContainer } from "../Utils";
import SpotifyPlayer from "../components/SpotifyPlayer";
import Logger from "@Utils/Logger";
import ErrorBoundary from "@Components/ErrorBoundary";
import Setting from "@Utils/Settings";
import { PlayerPlaceEnum } from "./../consts.js";

export default async () => {
	const fluxContainer = await getFluxContainer();
	if (!fluxContainer) return Logger.patchError("SpotifyPlayer");

	Patcher.after(fluxContainer.type.prototype, "render", (_, __, ret) => {
		/*DEBUG*/
		console.log(ret);
		/*DEBUG*/
		if (Setting.state.spotifyPlayerPlace !== PlayerPlaceEnum.USERAREA) return ret;
		if (Array.isArray(ret)) return;
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

export async function cleanFluxContainer() {
	const fluxContainer = await getFluxContainer();
	if (fluxContainer) fluxContainer.stateNode.forceUpdate();
}

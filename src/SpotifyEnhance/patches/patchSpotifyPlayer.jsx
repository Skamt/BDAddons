import { Patcher, React } from "@Api";
import { getFluxContainer } from "../Utils";
import SpotifyPlayer from "../components/SpotifyPlayer";
import Logger from "@Utils/Logger";
import ErrorBoundary from "@Components/ErrorBoundary";
import { PlayerPlaceEnum } from "./../consts.js";
import Settings, { renderListener } from "@Utils/Settings";
import { shallow } from "@Utils";

export default async () => {
	const fluxContainer = await getFluxContainer();
	if (!fluxContainer) return Logger.patchError("SpotifyPlayer");

	Patcher.after(fluxContainer.type.prototype, "render", (_, __, ret) => {
		/*DEBUG*/
		console.log(ret);
		/*DEBUG*/

		return [
			renderListener(
				<ErrorBoundary id="SpotifyPlayer">
					<SpotifyPlayer />
				</ErrorBoundary>,
				[_ => [_.player, _.spotifyPlayerPlace], shallow],
				([player, place]) => place === PlayerPlaceEnum.USERAREA && player,
				true
			),
			ret
		];
	});
	fluxContainer.stateNode.forceUpdate();
};

export async function cleanFluxContainer() {
	const fluxContainer = await getFluxContainer();
	if (fluxContainer) fluxContainer.stateNode.forceUpdate();
}

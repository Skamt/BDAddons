import { Patcher, React } from "@Api";
import { getFluxContainer } from "../Utils";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import UserStore from "@Stores/UserStore";
import Logger from "@Utils/Logger";
import ErrorBoundary from "@Components/ErrorBoundary";
import { PlayerPlaceEnum } from "@/consts.js";
import Settings from "@Utils/Settings";
import { getObjectKey } from "@Utils";
import { Filters, waitForModule } from "@Webpack";
import Plugin, { Events } from "@Utils/Plugin";

async function cleanFluxContainer() {
	const fluxContainer = await getFluxContainer();
	if (fluxContainer) fluxContainer?.stateNode?.forceUpdate();
}

Plugin.on(Events.START, () => {
	waitForModule(Filters.bySource("hasParty"), { raw: true }).then(({ declarations: UserPanelFluxContainer }) => {
		const key = getObjectKey(UserPanelFluxContainer, a => a?.prototype?.hasParty);
		if (!key) return Logger.patchError("SpotifyPlayer");

		Patcher.after(UserPanelFluxContainer[key].prototype, "render", (_, __, ret) => {
			DEV: {
				console.log(ret);
			}
			return [
				<ErrorBoundary
					key="SpotifyPlayer"
					id="SpotifyPlayer">
					<SpotifyPlayer />
				</ErrorBoundary>,
				ret
			];
		});

		UserStore.emitChange();
	});
});

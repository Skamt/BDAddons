import React from "@React";
import { after } from "@common/Patcher";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import UserStore from "@Stores/UserStore";
import Logger from "@Utils/Logger";
import ErrorBoundary from "@Components/ErrorBoundary";
import { Filters, lazy } from "@Webpack";
import Plugin from "@common/Plugin";

Plugin.onStart(() => {
	lazy(Filters.bySource("hasParty"), { decFilter: a => a?.prototype?.hasParty }).then(([m, k]) => {
		after(m[k].prototype, "render", ({ret}) => {
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

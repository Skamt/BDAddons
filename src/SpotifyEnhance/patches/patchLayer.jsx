import { getBySource, getModuleAndKey } from "@Webpack";
import { Patcher } from "@Api";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import ErrorBoundary from "@Components/ErrorBoundary";
import { renderListener } from "@Utils/Settings";
import { shallow } from "@Utils";
import { PlayerPlaceEnum } from "@/consts.js";
import React from "@React";
import Logger from "@Utils/Logger";

const AppLayerContainer = getModuleAndKey(a => a.displayName === "AppLayerContainer", { searchExports: true });
const Draggable = getBySource("edgeOffsetBottom", "defaultPosition")?.Z;

export default async () => {
	if (!AppLayerContainer) return Logger.patchError("PIP");

	const { module, key } = AppLayerContainer;
	Patcher.after(module, key, (_, __, ret) => {
		return [
			ret,
			renderListener(
				<ErrorBoundary id="PIP">
					<div className="pipContainer">
						<Draggable>
							<SpotifyPlayer />
						</Draggable>
					</div>
				</ErrorBoundary>,
				[_ => [_.player, _.spotifyPlayerPlace], shallow],
				([player, place]) => place === PlayerPlaceEnum.PIP && player,
				true
			)
		];
	});
};

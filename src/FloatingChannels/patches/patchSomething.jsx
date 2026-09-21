import React from "@React";
import { Patcher } from "@Api";
import { reRender } from "@Utils";
import ErrorBoundary from "@Components/ErrorBoundary";
import Logger from "@Utils/Logger";
import FloatingWindowContainer from "@/components/FloatingWindowContainer";
import { getModuleAndKey } from "@Webpack";
import Plugin from "@common/Plugin";

const AppLayerContainer = getModuleAndKey(a => a.displayName === "AppLayerContainer", { searchExports: true });

Plugin.onStart(() => {
	// if (!AppLayerContainer) return Logger.patchError("FloatingWindowContainer");
	// const { module, key } = AppLayerContainer;

	Patcher.after(...AppLayerContainer, (_, __, ret) => {
		return [
			ret,
			// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
			<ErrorBoundary>
				<FloatingWindowContainer />
			</ErrorBoundary>
		];
	});
	reRender('div[data-windows="true"] > *');

	Plugin.once(Events.STOP, () => reRender('div[data-windows="true"] > *'));
});

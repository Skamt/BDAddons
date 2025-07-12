import React from "@React";
import { Patcher } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";
import Logger from "@Utils/Logger";
import FloatingWindowContainer from "@/components/FloatingWindowContainer";
import { getModuleAndKey } from "@Webpack";

const AppLayerContainer = getModuleAndKey(a => a.displayName === "AppLayerContainer", { searchExports: true });

export default async () => {
	if (!AppLayerContainer) return Logger.patchError("PIP");

	const { module, key } = AppLayerContainer;
	Patcher.after(module, key, (_, __, ret) => {
		return [
			ret,
			// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
			<ErrorBoundary>
				<FloatingWindowContainer />
			</ErrorBoundary>
		];
	});
};

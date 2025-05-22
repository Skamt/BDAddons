import React from "@React";
import { Patcher } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";
import Logger from "@Utils/Logger";
// import { Store } from "@/Store";
import FloatingWindowContainer from "@/components/FloatingWindowContainer";
import { getFluxContainer } from "../Utils";


export default async () => {
	const fluxContainer = await getFluxContainer();
	if (!fluxContainer) return Logger.patchError("FlowtingWindowError");

	Patcher.after(fluxContainer.type.prototype, "render", (_, __, ret) => {
		// if (Array.isArray(ret)) return;
		
		return [
			ret,
			<ErrorBoundary>
				<FloatingWindowContainer />
			</ErrorBoundary>
		];
	});
	fluxContainer.stateNode.forceUpdate();
};

export async function cleanFluxContainer() {
	const fluxContainer = await getFluxContainer();
	if (fluxContainer) fluxContainer.stateNode.forceUpdate();
}

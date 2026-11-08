import { nop } from "@Utils";
import { Filters, getBySource } from "@Webpack";

const SyncLane = 2;

function markFiber(fiber) {
	fiber.flags = 131072;
	if (fiber.alternate) fiber.alternate.flags = 131072;
}

const getOriginal = component => component?.__originalFunction ?? component;

export const rerenderComponent = (() => {
	const { enqueueUpdate, scheduleUpdateOnFiber } = getBySource(".errorRecoveryDisabledLanes|=", {
		mapDeclarations: true,
		map: {
			enqueueUpdate: Filters.byStrings("|=", "++]", ".alternate"),
			scheduleUpdateOnFiber: Filters.byStrings("||null!==", ".cancelPendingCommit)&&(")
		}
	});

	if (!enqueueUpdate || !scheduleUpdateOnFiber) {
		console.warn("Could not find React's [enqueueUpdate,  scheduleUpdateOnFiber]");
		return nop;
	}

	return (component, fiberFilter) => {
		if (Array.isArray(component)) component = component[0]?.[component[1]];
		const original = getOriginal(component);
		if (typeof original !== "function") return;
		const container = document.getElementById("app-mount");
		const key = container && Object.keys(container).find(key => key.startsWith("__reactContainer$"));
		const root = key ? container[key] : undefined;

		const stack = [root?.stateNode?.current ?? root];
		while (stack.length) {
			const fiber = stack.pop();
			if (!fiber) continue;
			stack.push(fiber.sibling, fiber.child);
			if (getOriginal(fiber.type) !== original || (fiberFilter && !fiberFilter(fiber))) continue;

			for (const version of [fiber, fiber.alternate]) {
				if (!version) continue;
				if (version.elementType === version.type) version.elementType = component;
				version.type = component;
			}
			markFiber(fiber);
			enqueueUpdate(fiber, null, null, SyncLane);
			scheduleUpdateOnFiber(root, fiber, SyncLane);
		}
	};
})();

import { Patcher, findInTree } from "@Api";
import { Filters, getMangled, getModule } from "@Webpack";
import Logger from "@Utils/Logger";
import React from "@React";
import ErrorBoundary from "@Components/ErrorBoundary";
import EmojisComponent from "@/components/EmojisComponent";
import Plugin, { Events } from "@Utils/Plugin";

const ExpressionPicker = getModule((a) => a?.type?.toString().includes("handleDrawerResizeHandleMouseDown"), { searchExports: false });

const { ExpressionPickerStore } = getMangled("expression-picker-last-active-view", {
	ExpressionPickerStore: (a) => a.getState,
});
const VIEW_TYPE = "SAVED_EMOJIS";

Plugin.on(Events.START, () => {
	if (!ExpressionPicker) return Logger.patchError("ExpressionPicker");
	Patcher.after(ExpressionPicker, "type", (_, args, ret) => {
		const thing = findInTree(ret, Filters.byKeys("align", "autoInvert"), { walkable: ["props", "children"] });
		if (!thing?.children) return ret;

		const unpatch = Patcher.after(thing, "children", (_, args, ret) => {
			unpatch();

			const body = findInTree(ret, (el) => el?.[0]?.type === "nav", { walkable: ["props", "children"] });
			const head = findInTree(body, (el) => el?.[0]?.props?.["aria-selected"] !== void 0, { walkable: ["props", "children"] });

			const TabButtonComponent = head?.[0]?.type?.type;
			if (!TabButtonComponent) return;

			const activeView = ExpressionPickerStore.getState().activeView;
			const selected = VIEW_TYPE === activeView;

			head.push(
				<ErrorBoundary id="EmojisComponent-TabButtonComponent">
					<TabButtonComponent id={VIEW_TYPE} aria-controls={VIEW_TYPE} aria-selected={selected} viewType={VIEW_TYPE} isActive={selected}>
						My Tab
					</TabButtonComponent>
				</ErrorBoundary>,
			);

			if (selected) {
				body.push(
					<ErrorBoundary id="EmojisComponent">
						<EmojisComponent />
					</ErrorBoundary>,
				);
			}
		});
	});
});


import Plugin from "@common/Plugin";
import React from "@React";
import { after } from "@common/Patcher";
import { findKey, getDeclarationAndKey, reactRefMemoFilter, Filters, getModule } from "@Webpack";
import ErrorBoundary from "@Components/ErrorBoundary";

const $$ = getModule(Filters.bySource("__unsupportedReactNodeAsText", ".me", "onTooltipShow"), { declarationFilter: Filters.byStrings(".me") });
const useShiftKey = findKey(getModule(Filters.bySource(`addEventListener("mousemove"`, "delete", "size", "shiftKey")), () => true);
const MiniPopover = getDeclarationAndKey(BdApi.Webpack.Filters.bySource("reply-self", "mark-unread"), Filters.byStrings("isExpanded", "isModeratorReportChannel"));
const NP = getModule(Filters.bySource("reply-self", "mark-unread"), { declarationFilter: reactRefMemoFilter("type", "isEmojiFilteredOrLocked") });

Plugin.onStart(() => {
	after(...useShiftKey, () => true);

	after(...MiniPopover, ({ args: [props], ret }) => {
		ret.props.children.unshift(
			<ErrorBoundary>
				<NP {...props} />
				<$$ />
			</ErrorBoundary>
		);
	});
});

import Plugin from "@common/Plugin";
import React from "@React";
import { after } from "@common/Patcher";
import { findKey, lazy, getByKeys, reactRefMemoFilter, Filters, waitForComponent, getModule } from "@Webpack";
import ErrorBoundary from "@Components/ErrorBoundary";
import Settings from "@Settings";

const PopoverClasses = getByKeys("separator", "popover");
const useShiftKey = findKey(getModule(Filters.bySource(`addEventListener("mousemove"`, `addEventListener("blur"`, "useState")), () => true);
// const MiniPopover = getDeclarationAndKey(Filters.bySource("reply-self", "mark-unread"), Filters.byStrings("isExpanded", "isModeratorReportChannel"));
const NP = waitForComponent(Filters.bySource("reply-self", "mark-unread"), { declarationFilter: reactRefMemoFilter("type", "isEmojiFilteredOrLocked") });

Plugin.onStart(() => {
	after(...useShiftKey, () => Settings.state.showAll);

	lazy(Filters.bySource("reply-self", "mark-unread"), { decFilter: Filters.byStrings("isExpanded", "isModeratorReportChannel") }).then(MiniPopover =>
		after(...MiniPopover, ({ args: [props], ret }) => {
			if (!Settings.state.showAll) return ret;
			ret.props.children.unshift(
				<ErrorBoundary>
					<NP {...props} />
					<div className={PopoverClasses.separator} />
				</ErrorBoundary>
			);
		})
	);
});

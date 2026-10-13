import Plugin from "@common/Plugin";
import React from "@React";
import { after } from "@common/Patcher";
import { lazy, reactRefMemoFilter, Filters, waitForComponent } from "@Webpack";
import ErrorBoundary from "@Components/ErrorBoundary";
import Settings from "@Settings";

const QuickEmojis = waitForComponent(Filters.bySource("reply-self", "mark-unread"), {
	declarationFilter: reactRefMemoFilter("type", "isEmojiFilteredOrLocked")
});

Plugin.onStart(() => {
	lazy(Filters.bySource(`addEventListener("mousemove"`, `addEventListener("blur"`, "useState"), {
		sourceFilter: () => true
	}).then(useShiftKey => {
		if(!useShiftKey) return;
		after(...useShiftKey, () => Settings.state.showAll);
	});

	lazy(Filters.bySource("reply-self", "mark-unread"), {
		decFilter: Filters.byStrings("isExpanded", "isModeratorReportChannel")
	}).then(MiniPopover =>
		after(...MiniPopover, ({ args: [props], ret }) => {
			if (!Settings.state.showAll) return;
			ret.props.children.unshift(
				<ErrorBoundary>
					<QuickEmojis {...props} />
					<div className="messagepopover_separator" />
				</ErrorBoundary>
			);
		})
	);
});

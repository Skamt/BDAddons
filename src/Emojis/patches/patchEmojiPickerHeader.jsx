import { Patcher } from "@Api";
import { getNestedProp, promiseHandler, concateClassNames } from "@Utils";
import { Filters, getMangled, lazy } from "@Webpack";
import React from "@React";
import Logger from "@Utils/Logger";
import Plugin, { Events } from "@Utils/Plugin";
import { openEmojiManager } from "@/components/EmojiManager";
import { SettingIcon } from "@Components/icon";
import Tooltip from "@Components/Tooltip";
import { ManaButton } from "@Components/Button";
import { ModalActions } from "@Utils/Modals";

// const EmojiPickerHeader = getModuleAndKey(Filters.byStrings("selectedSurrogate"));
const EmojiPickerHeader = lazy(Filters.bySource("selectedSurrogate"), { declarationsFilter: Filters.byStrings("ion:f,onBurstRea") });

// const { ExpressionPickerStore } = getMangled("expression-picker-last-active-view", {
// 	ExpressionPickerStore: (a) => a.getState,
// });

// function closeExpressionPicker() {
// 	const state = ExpressionPickerStore.getState();
// 	ExpressionPickerStore.setState({
// 		activeView: null,
// 		activeViewType: null,
// 		activeChannelId: null,
// 		lastActiveView: state.activeView,
// 	});
// }

Plugin.on(Events.START, async () => {
	const [err, { module, key }] = await promiseHandler(EmojiPickerHeader);
	if (err || !module || !key) return Logger.patchError("patchEmojiPickerHeader");

	if (Plugin.stopped) return;

	Patcher.after(module, key, (_, args, ret) => {
		const children = getNestedProp(ret, "props.children.props.children");
		if (!children || !Array.isArray(children)) return;

		children.push(
			<Tooltip note="Emoji settings">
				<ManaButton
					onClick={() => {
						// closeExpressionPicker();
						openEmojiManager();
					}}
					variant="icon-only"
					size="sm"
					icon={() => <SettingIcon width="20" height="20" />}
				/>
			</Tooltip>,
		);
	});
});

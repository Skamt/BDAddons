import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import CloseExpressionPicker from "@Patch/CloseExpressionPicker";
import Settings from "@Utils/Settings";
import Plugin, { Events } from "@Utils/Plugin";

Plugin.on(Events.START, () => {
	const { module, key } = CloseExpressionPicker;
	if (!module || !key) return Logger.patchError("CloseExpressionPicker");

	const unpatch = Patcher.after(module, key, (_, args, ret) => {
		Settings.state.setpreviewState(Settings.state.previewDefaultState);
	});

	Plugin.once(Events.STOP, unpatch);
});

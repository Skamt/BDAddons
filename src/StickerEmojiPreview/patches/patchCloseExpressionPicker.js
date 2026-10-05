import { after } from "@common/PAtcher";
import CloseExpressionPicker from "@Patch/CloseExpressionPicker";
import Settings from "@Settings";
import Plugin from "@common/Plugin";

Plugin.onStart(() => {
	after(...CloseExpressionPicker, () => {
		Settings.previewState.set(Settings.state.previewDefaultState);
	});
});

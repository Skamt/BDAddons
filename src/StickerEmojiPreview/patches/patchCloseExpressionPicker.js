import { after } from "@common/PAtcher";
import CloseExpressionPicker from "@Patch/CloseExpressionPicker";
import Settings from "@Utils/Settings";
import Plugin from "@common/Plugin";

Plugin.onStart(() => {
	after(...CloseExpressionPicker, (_, args, ret) => {
		Settings.setpreviewState(Settings.state.previewDefaultState);
	});
});

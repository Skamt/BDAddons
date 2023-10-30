import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import CloseExpressionPicker from "@Patch/CloseExpressionPicker";
import Settings from "@Utils/Settings";
export default () => {
	/**
	 * a listener for when experession picker is closed
	 */
	const { module, key } = CloseExpressionPicker;
	if (module && key)
		Patcher.after(module, key, () => {
			Settings.set("previewState", Settings.get("previewDefaultState"));
		});
	else Logger.patch("CloseExpressionPicker");
};
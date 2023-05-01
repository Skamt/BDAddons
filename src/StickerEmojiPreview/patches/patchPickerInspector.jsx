import config from "@config";

import { nop } from "@Utils";
import Settings from "@Utils/Settings";
import Logger from "@Utils/Logger";
import { React, Patcher } from "@Api";

import ExpressionPickerInspector from "@Patch/ExpressionPickerInspector";
import CloseExpressionPicker from "@Patch/CloseExpressionPicker";

import PreviewComponent from "../components/PreviewComponent";
import ErrorBoundary from "../components/ErrorBoundary";

import { PREVIEW_SIZE, PREVIEW_UNAVAILABLE } from "../Constants";

function getMediaInfo({ props, type }) {
	if (props.sticker) return [type, props];
	if (props.src) return [type, { src: props.src.replace(/([?&]size=)(\d+)/, `$1${PREVIEW_SIZE}`) || PREVIEW_UNAVAILABLE }];

	return ["img", null];
}

function getPreviewComponent(graphicPrimary) {
	const [TypeComponent, props] = getMediaInfo(graphicPrimary);

	return (
		<TypeComponent
			{...props}
			disableAnimation={false}
			size={PREVIEW_SIZE}
		/>
	);
}

export default () => {
	/**
	 * Main patch for the plugin
	 */
	const { module, key } = ExpressionPickerInspector;
	if (module && key)
		Patcher.after(module, key, (_, [{ graphicPrimary, titlePrimary }], ret) => {
			if (titlePrimary?.toLowerCase().includes("upload")) return;
			return (
				<ErrorBoundary
					id="PreviewComponent"
					plugin={config.info.name}
					fallback={ret}>
					<PreviewComponent
						target={ret}
						defaultState={CloseExpressionPicker ? Settings.get("previewState") : false}
						setPreviewState={CloseExpressionPicker ? e => Settings.set("previewState", e) : nop}
						previewComponent={getPreviewComponent(graphicPrimary)}
					/>
				</ErrorBoundary>
			);
		});
	else Logger.patch("patchUserBannerMask");
};

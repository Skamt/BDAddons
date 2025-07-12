import config from "@Config";
import { nop } from "@Utils";
import Logger from "@Utils/Logger";
import { React, Patcher } from "@Api";
import Plugin, { Events } from "@Utils/Plugin";

import ExpressionPickerInspector from "@Patch/ExpressionPickerInspector";
import CloseExpressionPicker from "@Patch/CloseExpressionPicker";

import PreviewComponent from "@/components/PreviewComponent";
import ErrorBoundary from "@Components/ErrorBoundary";

import { PREVIEW_SIZE, PREVIEW_UNAVAILABLE } from "@/Constants";

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

Plugin.on(Events.START, () => {
	const { module, key } = ExpressionPickerInspector;
	if (!module || !key) return Logger.patchError("ExpressionPickerInspector");
	const unpatch = Patcher.after(module, key, (_, [{ graphicPrimary, titlePrimary }], ret) => {
		if (titlePrimary?.toLowerCase().includes("upload")) return;
		return (
			<ErrorBoundary
				id="PreviewComponent"
				plugin={config.info.name}
				fallback={ret}>
				<PreviewComponent
					target={ret}
					previewComponent={getPreviewComponent(graphicPrimary)}
				/>
			</ErrorBoundary>
		);
	});

	Plugin.once(Events.STOP, unpatch);
});

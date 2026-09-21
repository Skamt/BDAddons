import React from "@React";
import { after } from "@common/PAtcher";
import Plugin from "@common/Plugin";
import ExpressionPickerInspector from "@Patch/ExpressionPickerInspector";
import PreviewComponent from "@/components/PreviewComponent";
import ErrorBoundary from "@Components/ErrorBoundary";

import { PREVIEW_SIZE, PREVIEW_UNAVAILABLE } from "@/Constants";

function getMediaInfo({ props, type }) {
	if (props.sticker) return [type, props];
	if (props.src)
		return [
			type,
			{ src: props.src.replace(/([?&]size=)(\d+)/, `$1${PREVIEW_SIZE}`) || PREVIEW_UNAVAILABLE },
		];

	return ["img", null];
}

function getPreviewComponent(graphicPrimary) {
	const [TypeComponent, props] = getMediaInfo(graphicPrimary);

	return <TypeComponent {...props} disableAnimation={false} size={PREVIEW_SIZE} />;
}

Plugin.onStart(() => {
	const {module, key} = ExpressionPickerInspector;
	after(module, key, (_, [{ graphicPrimary, titlePrimary }], ret) => {
		if (titlePrimary?.toLowerCase().includes("upload")) return;
		return (
			<ErrorBoundary id="PreviewComponent" fallback={ret}>
				<PreviewComponent target={ret} previewComponent={getPreviewComponent(graphicPrimary)} />
			</ErrorBoundary>
		);
	});
});

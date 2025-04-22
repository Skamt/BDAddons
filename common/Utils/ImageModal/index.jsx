import "./styles";
import { React } from "@Api";
import { Filters, getModule } from "@Webpack";

export const RenderLinkComponent = getModule(m => m.type?.toString?.().includes("MASKED_LINK"), { searchExports: false });
export const ImageModal = getModule(m => m.type?.toString?.().includes("ZOOM_OUT_IMAGE_PRESSED"), { searchExports: true });

export const getImageComponent = (url, rest = {}) => {
	return (
		<div className="imageModalwrapper">
			<ImageModal
				maxWidth={rest.maxWidth}
				maxHeight={rest.maxHeight}
				media={{
					...rest,
					type: "IMAGE",
					url: url,
					proxyUrl: url
				}}
			/>
			<div className="imageModalOptions">
				<RenderLinkComponent
					className="downloadLink"
					href={url}>
					Open in Browser
				</RenderLinkComponent>
			</div>
		</div>
	);
};

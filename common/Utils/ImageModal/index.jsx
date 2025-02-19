import "./styles";
import { React } from "@Api";
import { Filters, getModule } from "@Webpack";
export const RenderLinkComponent = getModule(m => m.type?.toString?.().includes("MASKED_LINK"), { searchExports: false });

export const ImageModal = getModule(Filters.byStrings("renderLinkComponent", "zoomThumbnailPlaceholder"), { searchExports: true });

export const getImageComponent = (url, rest = {}) => {
	return (
		<div className="imageModalwrapper">
			<ImageModal
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

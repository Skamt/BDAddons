import "./styles";
import React, { useMemo, useState } from "@React";
import { Filters, reactRefMemoFilter, getModule } from "@Webpack";
import AccessibilityStore from "@Stores/AccessibilityStore";

export const RenderLinkComponent = getModule(m => m.type?.toString?.().includes("MASKED_LINK"), { searchExports: false });
export const ImageModal = getModule(reactRefMemoFilter("type", "renderLinkComponent"), { searchExports: true });

function h(e, t) {
	let n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
	!0 === n || AccessibilityStore.useReducedMotion ? e.set(t) : e.start(t);
}

const useSomeScalingHook = getModule(Filters.byStrings("reducedMotion.enabled", "useSpring", "respect-motion-settings"), { searchExports: true });
const context = getModule(a => a?._currentValue?.scale, { searchExports: true });

export const ImageComponent = ({ url, ...rest }) => {
	const [x, P] = useState(false);
	const [M, w] = useSomeScalingHook(() => ({
		scale: AccessibilityStore.useReducedMotion ? 1 : 0.9,
		x: 0,
		y: 0,
		config: {
			friction: 30,
			tension: 300
		}
	}));

	const contextVal = useMemo(
		() => ({
			scale: M.scale,
			x: M.x,
			y: M.y,
			setScale(e, t) {
				h(M.scale, e, null == t ? void 0 : t.immediate);
			},
			setOffset(e, t, n) {
				h(M.x, e, null == n ? void 0 : n.immediate), h(M.y, t, null == n ? void 0 : n.immediate);
			},
			zoomed: x,
			setZoomed(e) {
				P(e), h(M.scale, e ? 2.5 : 1), e || (h(M.x, 0), h(M.y, 0));
			}
		}),
		[x, M]
	);

	return (
		<context.Provider value={contextVal}>
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
				{!x && (
					<div className="imageModalOptions">
						<RenderLinkComponent
							className="downloadLink"
							href={url}>
							Open in Browser
						</RenderLinkComponent>
					</div>
				)}
			</div>
		</context.Provider>
	);
};

import React from "@React";
import { getModule, Filters } from "@Webpack";
import { getInObject } from "@Utils/Object";
const GridScroller = getInObject(getModule(Filters.bySource("columns", "getSectionHeight","ResizeObserver", "forceUpdateOnChunkChange")), () => true);

export default GridScroller ||
	function GridScrollerFallback(props) {
		return <div {...props} />;
	};

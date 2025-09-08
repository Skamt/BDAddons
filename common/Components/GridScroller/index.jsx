import React from "@React";
import { getModule, reactRefMemoFilter } from "@Webpack";
const GridScroller = getModule(reactRefMemoFilter("render", "columns", "getSectionHeight"), { searchExports: true });

export default GridScroller ||
	function GridScrollerFallback(props) {
		return <div {...props} />;
	};

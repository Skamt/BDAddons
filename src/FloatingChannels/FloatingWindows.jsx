import React from "@React";
import { ReactDOM } from "@Api";
// import { Store } from "@/Store";
import FloatingWindowContainer from "@/components/FloatingWindowContainer";
import ErrorBoundary from "@Components/ErrorBoundary";

const floatingWindowContainer = Object.assign(document.createElement("div"), { className: "floating-window-root" });

export default {
	init() {
		document.body.appendChild(floatingWindowContainer);
		this.root = ReactDOM.createRoot(floatingWindowContainer);
		this.root.render(
			<ErrorBoundary>
				<FloatingWindowContainer />
			</ErrorBoundary>
		);
	},
	dispose() {
		this.root.unmount();
		floatingWindowContainer.remove();
	}
};


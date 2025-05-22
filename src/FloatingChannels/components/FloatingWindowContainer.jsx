import React from "@React";
import { Store } from "@/Store";
import FloatingChannel from "./FloatingChannel";
export default React.memo(() => {
	const windows = Store(Store.selectors.windows);

	return (
		<div className="floating-window-root">
			{windows.map(({ id }) => (
				<FloatingChannel
					key={id}
					id={id}
				/>
			))}
		</div>
	);
});

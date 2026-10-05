import React, { useEffect } from "@React";
import Settings from "@Settings";
import Popout from "@Components/Popout";
import { PREVIEW_SIZE } from "../Constants";

export default ({ target, previewComponent }) => {
	const show = Settings.previewState();

	useEffect(() => {
		function keyupHandler(e) {
			if (e.key === "Control") {
				Settings.previewState.set(!show);
			}
		}
		document.addEventListener("keyup", keyupHandler);
		return () => document.removeEventListener("keyup", keyupHandler);
	}, [show]);

	return (
		<Popout
			renderPopout={() => (
				<div
					className="stickersPreview"
					style={{ width: `${PREVIEW_SIZE}px` }}>
					{previewComponent}
				</div>
			)}
			shouldShow={show}
			position="left"
			align="bottom"
			animation="1"
			spacing={60}>
			{() => target}
		</Popout>
	);
};

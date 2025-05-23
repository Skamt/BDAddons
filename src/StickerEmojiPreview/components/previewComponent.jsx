import React, {useRef} from "@React";
import Settings from "@Utils/Settings";
import { DiscordPopout } from "@Discord/Modules";
import { PREVIEW_SIZE } from "../Constants";

export default ({ target, previewComponent }) => {
	const [show, setShow] = Settings.useSetting("previewState");
	const ref = useRef();
	React.useEffect(() => {
		function keyupHandler(e) {
			if (e.key === "Control") {
				setShow(!show);
			}
		}
		document.addEventListener("keyup", keyupHandler);
		return () => document.removeEventListener("keyup", keyupHandler);
	}, [show]);

	return (
		<DiscordPopout
			renderPopout={() => (
				<div
					className="stickersPreview"
					style={{ width: `${PREVIEW_SIZE}px` }}>
					{previewComponent}
				</div>
			)}
			targetElementRef={ref}
			shouldShow={show}
			position="left"
			align="bottom"
			animation="1"
			spacing={60}>
			{() => <div ref={ref}>{target}</div>}
		</DiscordPopout>
	);
};

import { React } from "@Api";
import Settings from "@Utils/Settings";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import {PREVIEW_SIZE} from "../Constants";
const { Popout } = TheBigBoyBundle;

export default ({ target, previewComponent }) => {
	const [show, setShow] = Settings.useSetting("previewState");

	React.useEffect(() => {
		function keyupHandler(e) {
			if(e.key === "Control"){
				setShow(!show);
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
			animation="3"
			spacing={60}>
			{() => target}
		</Popout>
	);
};

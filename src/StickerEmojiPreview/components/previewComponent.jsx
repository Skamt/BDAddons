import { React } from "@Api";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import {PREVIEW_SIZE} from "../Constants";

const { Popout } = TheBigBoyBundle;

export default ({ target, defaultState, setPreviewState, previewComponent }) => {
	const [show, setShow] = React.useState(defaultState);
	React.useEffect(() => {
		function keyupHandler(e) {
			if(e.key === "Control"){
				setPreviewState(!show);
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

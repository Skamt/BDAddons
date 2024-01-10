import { React } from "@Api";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

const { Popout } = TheBigBoyBundle;

export default ({ spacing, forceShow,position, animation, align, renderPopout, children }) => {
	const [show, setShow] = React.useState(false);
	// const [mouse, setMouse] = React.useState(false);

	// React.useEffect(() => {
	// 	const options = { capture: true };
	// 	function mousedownHandler() {
	// 		setMouse(true);
	// 	}
	// 	document.addEventListener("mousedown", mousedownHandler, options);
	// 	return () => document.removeEventListener("mousedown", mousedownHandler, options);
	// }, []);

	// React.useEffect(() => {
	// 	const options = { capture: true };
	// 	function mouseupHandler() {
	// 		setMouse(false);
	// 		if (show) setShow(false);
	// 	}
	// 	document.addEventListener("mouseup", mouseupHandler, options);
	// 	return () => document.removeEventListener("mouseup", mouseupHandler, options);
	// }, [show]);

	return (
		<div
			className={`${config.info.name}-popout-container`}
			onMouseLeave={() => setShow(false)}
			onMouseEnter={() => setShow(true)}>
			<Popout
				renderPopout={renderPopout}
				shouldShow={forceShow || show}
				onRequestClose={() => setShow(false)}
				position={position ?? "top"}
				align={align ?? "left"}
				animation={animation ?? "1"}
				spacing={spacing ?? 8}>
				{() => children}
			</Popout>
		</div>
	);
};

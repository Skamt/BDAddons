import { React } from "@Api";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

const { Popout } = TheBigBoyBundle;

export default ({ delay, spacing, forceShow, position, animation, align, className, renderPopout, children }) => {
	const [show, setShow] = React.useState(false);
	const leaveRef = React.useRef();
	const enterRef = React.useRef();

	return (
		<div
			className={`${config.info.name}-popout-container ${className ? className : ""}`}
			onMouseLeave={() => {
				clearTimeout(enterRef.current);
				enterRef.current = null;
				leaveRef.current = setTimeout(() => {
					setShow(false);
					leaveRef.current = null;
				}, 150);
			}}
			onMouseEnter={() => {
				if (leaveRef.current) {
					clearTimeout(leaveRef.current);
					leaveRef.current = null;
					return;
				}

				enterRef.current = setTimeout(() => {
					console.log("onMouseEnter delayed setShow setTimeout");
					setShow(true);
				}, delay || 150);
			}}>
			<Popout
				renderPopout={renderPopout}
				shouldShow={forceShow || show}
				onRequestClose={() => console.log("onRequestClose")}
				onRequestOpen={() => console.log("onRequestOpen")}
				position={position ?? "top"}
				align={align ?? "left"}
				animation={animation ?? "1"}
				spacing={spacing ?? 8}>
				{() => children}
			</Popout>
		</div>
	);
};

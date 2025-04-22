import { React } from "@Api";
import { getModule, Filters } from "@Webpack";

export const DiscordPopout = getModule(Filters.byPrototypeKeys("shouldShowPopout","toggleShow"), { searchExports: true });

export default ({ delay, spacing, forceShow, position, animation, align, className, renderPopout, children, ...rest }) => {
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
					setShow(true);
				}, delay || 150);
			}}>
			<DiscordPopout
				renderPopout={renderPopout}
				shouldShow={forceShow || show}
				position={position ?? "top"}
				align={align ?? "left"}
				animation={animation ?? "1"}
				spacing={spacing ?? 8}
				{...rest}>
				{() => children}
			</DiscordPopout>
		</div>
	);
};

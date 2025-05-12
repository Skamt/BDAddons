import { DiscordPopout } from "@Discord/Modules";
import React, { useRef, useState } from "@React";
import { concateClassNames } from "@Utils";

export default ({ delay, spacing, forceShow, position, animation, align, className, renderPopout, children, ...rest }) => {
	const [show, setShow] = useState(false);
	const leaveRef = useRef();
	const enterRef = useRef();

	return (
		<div
			className={concateClassNames(`${config.info.name}-popout-container`, className)}
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

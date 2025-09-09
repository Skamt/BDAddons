import config from "@Config";
import { DiscordPopout } from "@Discord/Modules";
import React, { useRef, useState } from "@React";
import { concateClassNames } from "@Utils";

export default ({ children, targetElementRef, ...props }) => {
	const ref = useRef();

	return (
		<DiscordPopout
			position={"top"}
			align={"center"}
			nudgeAlignIntoViewport={true}
			animation={DiscordPopout.Animation.FADE}
			spacing={4}
			{...props}
			targetElementRef={targetElementRef || ref}>
			{p => (targetElementRef ? children(p) : React.cloneElement(children(p), { ref: ref }))}
		</DiscordPopout>
	);
};

// export const b = ({ delay, spacing, forceShow, position, animation, align, className, renderPopout, children, ...rest }) => {
// 	const [show, setShow] = useState(false);
// 	const ref = useRef();
// 	const leaveRef = useRef();
// 	const enterRef = useRef();

// 	return (
// 		<div
// 			className={concateClassNames(`${config.info.name}-popout-container`, className)}
// 			onMouseLeave={() => {
// 				clearTimeout(enterRef.current);
// 				enterRef.current = null;
// 				leaveRef.current = setTimeout(() => {
// 					setShow(false);
// 					leaveRef.current = null;
// 				}, 150);
// 			}}
// 			onMouseEnter={() => {
// 				if (leaveRef.current) {
// 					clearTimeout(leaveRef.current);
// 					leaveRef.current = null;
// 					return;
// 				}
// 				enterRef.current = setTimeout(() => {
// 					setShow(true);
// 				}, delay || 150);
// 			}}>
// 			<DiscordPopout
// 				renderPopout={renderPopout}
// 				shouldShow={forceShow || show}
// 				targetElementRef={ref}
// 				position={position ?? "top"}
// 				align={align ?? "left"}
// 				animation={animation ?? "1"}
// 				spacing={spacing ?? 8}
// 				{...rest}>
// 				{() => React.cloneElement(children, { ref: ref })}
// 			</DiscordPopout>
// 		</div>
// 	);
// };

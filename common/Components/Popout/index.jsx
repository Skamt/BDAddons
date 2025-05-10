import { DiscordPopout } from "@Discord/Modules";
import React, { useRef, useEffect, useState } from "@React";
import { concateClassNames, nop } from "@Utils";

export default ({ showOnContextMenu, showOnClick, delay, spacing, forceShow, position, animation, align, className, renderPopout, children, ...rest }) => {
	const [show, setShow] = useState(false);
	const leaveRef = useRef();
	const enterRef = useRef();

	useEffect(() => {
		if (!showOnClick && !showOnContextMenu) return;

		function clickHandler() {
			setShow(false);
		}
		window.addEventListener("mouseup", clickHandler);
		return () => window.removeEventListener("mouseup", clickHandler);
	}, []);

	const clickHandler = e => {
		e.stopPropagation();
		setShow(!show);
	};

	const mouseLeaveHandler = () => {
		clearTimeout(enterRef.current);
		enterRef.current = null;
		leaveRef.current = setTimeout(() => {
			setShow(false);
			leaveRef.current = null;
		}, 150);
	};

	const mouseEnterHandler = () => {
		if (leaveRef.current) {
			clearTimeout(leaveRef.current);
			leaveRef.current = null;
			return;
		}
		enterRef.current = setTimeout(() => {
			setShow(true);
		}, delay || 150);
	};

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
		<div
			className={concateClassNames(`${config.info.name}-popout-container`, className)}
			onClick={!showOnClick ? nop : clickHandler}
			onContextMenu={!showOnContextMenu ? nop : clickHandler}
			onMouseLeave={showOnContextMenu || showOnClick ? nop : mouseLeaveHandler}
			onMouseEnter={showOnContextMenu || showOnClick ? nop : mouseEnterHandler}>
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

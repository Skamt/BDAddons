import config from "@Config";
import { DiscordPopout } from "@Discord/Modules";
import React, { Children, useEffect, useRef, useState } from "@React";
import { concateClassNames } from "@Utils";
import { useTimer } from "@Utils/Hooks";
import Popout from "@Components/Popout";

export default function HoverPopout({ children, popout, delay = 150, popoutWrapperClassName, ...popoutProps }) {
	const [show, setShow] = useState(false);
	const [mouseLeaveHandler, clearLeave] = useTimer(() => setShow(false), delay);
	const [mouseEnterHandler, clearEnter] = useTimer(() => setShow(true), delay);
	useEffect(
		() => () => {
			clearLeave();
			clearEnter();
		},
		[]
	);
	const child = Children.only(children);
	const content = e =>
		React.cloneElement(child, {
			onMouseEnter: e => {
				clearLeave();
				child.props.onMouseenter?.(e);
				mouseEnterHandler(e);
			},
			onMouseLeave: e => {
				clearEnter();
				child.props.onMouseLeave?.(e);
				mouseLeaveHandler(e);
			}
		});

	const popoutContent = e => (
		<div
			className={concateClassNames("popoutMouseEventsTrapper", popoutWrapperClassName)}
			onMouseLeave={(e)=>{
				clearEnter(e);
				mouseLeaveHandler(e)
			}}
			onMouseEnter={(e)=>{
				clearLeave();
				mouseEnterHandler(e);
			}}>
			{popout(e)}
		</div>
	);

	return (
		<Popout
			{...popoutProps}
			onRequestClose={() => setShow(false)}
			shouldShow={show}
			renderPopout={popoutContent}>
			{content}
		</Popout>
	);
}

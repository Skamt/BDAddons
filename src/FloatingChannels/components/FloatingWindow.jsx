import React, { useRef, useEffect } from "@React";
import { useResizable, useDraggable } from "@/utils";
import { CloseIcon } from "@Components/Icon";
import { concateClassNames } from "@Utils";
import Draggabilly from "draggabilly";

export default React.memo(function FloatingWindow({ focused, onMouseDown, title, content, onClose }) {
	const windowRef = useRef();
	const handle = useRef();
	// const [fw, handle] = useDraggable();
	const { getRootProps, getHandleProps, rootRef } = useResizable({
		initialWidth: window.innerWidth * 0.5,
		initialHeight: window.innerHeight * 0.5
	});

	useEffect(() => {
		const draggie = new Draggabilly(rootRef.current, {
			containment: "html",
			handle: handle.current
		});

		() => draggie.destroy();
	}, []);

	const { style } = getRootProps();

	return (
		<div
			style={style}
			ref={e => {
				windowRef.current = e;
				rootRef.current = e;
			}}
			onMouseDown={onMouseDown}
			className={concateClassNames("floating-window-container", focused && "focused-window")}>
			<div
				ref={handle}
				className="floating-window-title-bar">
				<div className="floating-window-title">{title}</div>
				<div
					className="floating-window-close"
					onClick={onClose}>
					<CloseIcon />
				</div>
			</div>
			<div className="floating-window-content">{content}</div>
			<div
				className="resize-handle resize-handle-top"
				{...getHandleProps({
					reverse: true,
					lockHorizontal: true,
					onResize: ({ heightDiff }) => {
						if (!rootRef.current) return;
						rootRef.current.style.top = `${Number.parseInt(rootRef.current.style.top || "0") - heightDiff}px`;
					}
				})}
			/>
			<div
				className="resize-handle resize-handle-top-left"
				{...getHandleProps({
					reverse: true,
					onResize: ({ widthDiff, heightDiff }) => {
						if (!rootRef.current) return;
						rootRef.current.style.left = `${Number.parseInt(rootRef.current.style.left || "0") - widthDiff}px`;
						rootRef.current.style.top = `${Number.parseInt(rootRef.current.style.top || "0") - heightDiff}px`;
					}
				})}
			/>
			<div
				className="resize-handle resize-handle-top-right"
				{...getHandleProps({
					reverseHeight: true,
					onResize: ({ heightDiff }) => {
						if (!rootRef.current) return;
						rootRef.current.style.top = `${Number.parseInt(rootRef.current.style.top || "0") - heightDiff}px`;
					}
				})}
			/>

			<div
				className="resize-handle resize-handle-bottom-right"
				{...getHandleProps({})}
			/>

			<div
				className="resize-handle resize-handle-bottom-left"
				{...getHandleProps({
					reverseWidth: true,
					onResize: ({ widthDiff }) => {
						if (!rootRef.current) return;
						rootRef.current.style.left = `${Number.parseInt(rootRef.current.style.left || "0") - widthDiff}px`;
					}
				})}
			/>

			<div
				className="resize-handle resize-handle-right"
				{...getHandleProps({
					lockVertical: true
				})}
			/>
			<div
				className="resize-handle resize-handle-bottom"
				{...getHandleProps({
					lockHorizontal: true
				})}
			/>
			<div
				className="resize-handle resize-handle-left"
				{...getHandleProps({
					reverse: true,
					lockVertical: true,
					onResize: ({ widthDiff }) => {
						if (!rootRef.current) return;
						rootRef.current.style.left = `${Number.parseInt(rootRef.current.style.left || "0") - widthDiff}px`;
					}
				})}
			/>
		</div>
	);
});

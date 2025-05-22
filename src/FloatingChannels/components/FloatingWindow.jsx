import React, { useEffect } from "@React";
import { useResizable, useDraggable } from "@/utils";
import { CloseIcon } from "@Components/Icon";
import { concateClassNames } from "@Utils";

export default function FloatingWindow({ focused, onMouseDown, title, content, onClose }) {
	const [fw, handle] = useDraggable();
	const { getRootProps, getHandleProps, rootRef } = useResizable({
		initialWidth: window.innerWidth * 0.8,
		initialHeight: window.innerHeight * 0.8
	});

	useEffect(() => {
		const targetEl = fw.current;
		if (!targetEl) return;
		const dx = (window.innerWidth - targetEl.clientWidth) / 2;
		const dy = (window.innerHeight - targetEl.clientHeight) / 2;
		targetEl.style.translate = `${dx}px ${dy}px`;
	}, []);

	// Handle reverse handle change
	const onReverseHandleChangeVertical = (parent, { heightDiff }) => {
		if (!parent.current) return;
		const [dx, dy] = getComputedStyle(parent.current)
			.translate.split(" ")
			.map(a => a.replace("px", ""));
		parent.current.style.translate = `${dx}px ${Number.parseInt(dy || "0") - heightDiff}px`;
	};

	// Handle reverse handle change
	const onReverseHandleChangeHorizontal = (parent, { widthDiff }) => {
		if (!parent.current) return;
		const [dx, dy] = getComputedStyle(parent.current)
			.translate.split(" ")
			.map(a => a.replace("px", ""));
		parent.current.style.translate = `${Number.parseInt(dx || "0") - widthDiff}px ${dy}px `;
	};

	const { style, ref } = getRootProps();

	return (
		<div
			style={style}
			ref={e => {
				ref.current = e;
				fw.current = e;
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
				className="resize-handle resize-handle-up"
				{...getHandleProps({
					reverse: true,
					lockHorizontal: true,
					onResize: values => onReverseHandleChangeVertical(rootRef, values)
				})}
			/>
			<div
				className="resize-handle resize-handle-right"
				{...getHandleProps({
					lockVertical: true
				})}
			/>
			<div
				className="resize-handle resize-handle-down"
				{...getHandleProps({
					lockHorizontal: true
				})}
			/>
			<div
				className="resize-handle resize-handle-left"
				{...getHandleProps({
					reverse: true,
					lockVertical: true,
					onResize: values => onReverseHandleChangeHorizontal(rootRef, values)
				})}
			/>
		</div>
	);
}

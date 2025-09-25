// import "./styles";
import Store from "@/Store";
import React from "@React";
import { transitionTo } from "@Discord/Modules";
import { classNameFactory, join } from "@Utils/css";

const c = classNameFactory("bookmark");

export default function BaseBookmark(props) {
	const { id, icon, title, onClose, path, noName, className, children, ...rest } = props;
	// const { isOver, canDrop, isDragging, dropRef, dragRef } = props;

	const onClick = e => {
		e.stopPropagation();
		onClose?.();

		if (e.ctrlKey) Store.newTab(path);
		else transitionTo(path);
	};

	return (
		<div
			{...rest}
			className={join(c("container"), "no-drag", "box-border", "card", className)}
			onClick={onClick}>
			{icon}
			{!noName && title && <div className={join(c("title"), "card-title")}>{title}</div>}
			{children}
		</div>
	);
}

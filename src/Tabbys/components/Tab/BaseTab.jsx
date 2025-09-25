import React from "@React";
import Store from "@/Store";
import { CloseIcon } from "@Components/Icon";
import { TabSortable, TabDroppable } from "@/components/DND";
import { classNameFactory, join } from "@Utils/css";

const c = classNameFactory("tab");

function BaseTab(props) {
	const { id, icon, title, hasUnread, children } = props;
	const isSelected = Store(Store.selectors.selectedId) === id;
	const isSingle = Store(Store.selectors.isSingle);
	const { isOver, canDrop, isDragging, dragRef, dropRef } = props;

	const onClick = e => {
		e.stopPropagation();
		Store.setSelectedId(id);
	};

	const onCloseClick = e => {
		e.stopPropagation();
		Store.removeTab(id);
	};

	return (
		<div
			ref={e => dragRef(dropRef(e))}
			// className={join(c("container"), { isSelected, hasUnread }, "no-drag", "box-border", "rounded-full", "card")}
			className={join(c("container", isOver && canDrop && "canDrop"), { isSelected, hasUnread, isDragging }, "no-drag", "box-border", "rounded-full", "card")}
			onClick={onClick}>
			<TabSortable id={id} />
			{icon}
			<div className={join(c("title"), "card-title", "ellipsis")}>{title}</div>
			{children}
			<div
				className={join(c("close-button"), "icon-wrapper", "card-button")}
				onClick={onCloseClick}>
				<CloseIcon />
			</div>
		</div>
	);
}

export default TabDroppable(BaseTab);

import "./styles";
import Store from "@/Store";
import { TabDroppable, TabSortable } from "@/components/DND";
import { CloseIcon } from "@Components/Icon";
import React from "@React";
import { shallow } from "@Utils";
import Settings from "@Utils/Settings";
import { classNameFactory, join } from "@Utils/css";
import TabContextMenu from "@/contextmenus/TabContextMenu";
import { ContextMenu } from "@Api";
import useStateFromStores from "@Modules/useStateFromStores";
import ReadStateStore from "@Stores/ReadStateStore";

const c = classNameFactory("tab");

function BaseTab({ id, icon, title, channelId, children, ...props }) {
	const { isOver, canDrop, isDragging, dragRef, dropRef } = props;
	const hasUnread = useStateFromStores([ReadStateStore], () => ReadStateStore.hasUnread(channelId), [channelId]);
	const [tabMinWidth, tabWidth] = Settings(_ => [_.tabMinWidth, _.tabWidth], shallow);
	const isSelected = Store(Store.selectors.selectedId) === id;
	const isSingle = Store(Store.selectors.isSingle);

	const onClick = e => {
		e.stopPropagation();
		Store.setSelectedId(id);
	};

	const onCloseClick = e => {
		e.stopPropagation();
		Store.removeTab(id);
	};

	const contextmenuHandler = e => {
		ContextMenu.open(e, TabContextMenu(id, { channelId, hasUnread }), {
			position: "bottom",
			align: "left"
		});
	};

	return (
		<div
			onContextMenu={contextmenuHandler}
			style={{
				"--tab-width": `${tabWidth}px`,
				"--tab-min-width": `${tabMinWidth}px`
			}}
			ref={e => dragRef(dropRef(e))}
			className={join(c("container", isOver && canDrop && "canDrop"), { isSelected, hasUnread, isDragging }, "card")}
			onClick={onClick}>
			<TabSortable id={id} />
			{icon}
			<div className={join(c("title"), "card-title")}>{title}</div>
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

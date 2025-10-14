import "./styles";
import Store from "@/Store";
import { TabDroppable, TabSortable } from "@/components/DND";
import { CloseIcon } from "@Components/Icon";
import React from "@React";
import { shallow } from "@Utils";
import { classNameFactory, join } from "@Utils/css";
import TabContextMenu from "@/contextmenus/TabContextMenu";
import { ContextMenu } from "@Api";
import useStateFromStores from "@Modules/useStateFromStores";
import ReadStateStore from "@Stores/ReadStateStore";
import Settings from "@Utils/Settings";
import ChannelStatus from "@/components/ChannelStatus";
import { Content } from "@/components/Card";

const c = classNameFactory("tab");

function Tab({ id, isOver, canDrop, isDragging, dragRef, dropRef }) {
	const tab = Store(state => Store.getTab(id), shallow);
	const { guildId, userId, path, channelId } = tab;

	const shouldHightLight = Settings(Settings.selectors.highlightTabUnread);
	const hasUnread = useStateFromStores([ReadStateStore], () => shouldHightLight && ReadStateStore.hasUnread(channelId), [shouldHightLight, channelId]);
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
		ContextMenu.open(e, TabContextMenu(id, { userId, path, guildId, channelId, hasUnread }), {
			position: "bottom",
			align: "left"
		});
	};

	return (
		<div
			onContextMenu={contextmenuHandler}
			ref={e => dragRef(dropRef(e))}
			className={join(c("container", isOver && canDrop && "canDrop"), { isSelected, hasUnread, isDragging }, "card")}
			onClick={onClick}>
			<TabSortable id={id} />
			<Content {...tab} />
			<ChannelStatus
				type="Tab"
				channelIds={[channelId]}
			/>
			<div
				className={join(c("close-button"), "icon-wrapper", "card-button")}
				onClick={onCloseClick}>
				<CloseIcon />
			</div>
		</div>
	);
}

export default React.memo(TabDroppable(Tab));

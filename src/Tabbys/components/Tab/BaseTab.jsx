import { Store } from "@/Store";
import CloseIcon from "@Components/icons/CloseIcon";
import React, { useRef } from "@React";
import { nop, concateClassNames } from "@Utils";
import DiscordIcon from "@Components/icons/DiscordIcon";

const DragSource = BdApi.Webpack.getByStrings("drag-source", "collect", { searchExports: true });
const DropTarget = BdApi.Webpack.getByStrings("drop-target", "collect", { searchExports: true });

// const [{ isDragging }, DragRef, preview] = useDrag(() => ({
// 	type: "TAB",
// 	item: { title },
// 	collect: monitor => ({
// 		isDragging: !!monitor.isDragging()
// 	}),
// 	end(item, monitor) {
// 		console.log(monitor.didDrop());
// 		// tabRef.current.style.transform = `none`;
// 	}
// }));

// const [{ isMe, isOver, canDrop }, DropRef] = useDrop(() => ({
// 	accept: "TAB",
// drop(item, monitor) {
// 	const dragged = title;
// 	const hoverOver = item.title;
// 	if (dragged === hoverOver) return;
// 	// console.log("canDrop",hoverOver, dragged);
// 	onReOrder(item.title, title);
// },
// collect: monitor => ({
// 	isOver: monitor.isOver(),
// 	canDrop: monitor.canDrop(),
// 	isMe:monitor.getItem()?.title === title
// })
// }));

function DragThis(comp) {
	return DropTarget(
		"TAB",
		{
			drop(thisTab, monitor) {
				const droppedTab = monitor.getItem();
				if (thisTab.id === droppedTab.id) return;
				Store.state.moveTab(droppedTab.id, thisTab.id);
			}
		},
		function (connect, monitor, props) {
			// console.log(arguments)
			return {
				isOver: monitor.isOver(),
				canDrop: monitor.canDrop(),
				dropRef: connect.dropTarget(),
				draggedIsMe: monitor.getItem()?.id === props.id
			};
		}
	)(
		DragSource(
			"TAB",
			{
				beginDrag(props) {
					return { id: props.id };
				}
			},
			(props, monitor) => ({
				isDragging: !!monitor.isDragging(),
				dragRef: props.dragSource()
			})
		)(comp)
	);
}

function BaseTab({ id, path, selected, icon, title, dragRef, dropRef, isOver, canDrop, draggedIsMe, isDragging }) {
	const tabRef = useRef(null);
	const isSingleTab = Store(state => state.tabs.length === 1);

	const clickHandler = e => {
		e.stopPropagation();
		Store.state.setSelectedId(id);
		return console.log(id, "clickHandler");
	};

	const closeHandler = e => {
		e.stopPropagation();
		Store.state.removeTab(id);
		return console.log(id, "closeHandler");
	};

	dragRef(dropRef(tabRef));

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
		<div
			ref={tabRef}
			className={concateClassNames("tab", selected && "selected-tab", isDragging && "dragging", !draggedIsMe && canDrop && isOver && "candrop")}
			onClick={!selected ? clickHandler : nop}>
			<div className={concateClassNames("tab-icon", !icon && "discord-icon")}>{icon || <DiscordIcon />}</div>
			<div className="tab-title ellipsis">{title || path}</div>
			{!isSingleTab && (
				// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
				<div
					className="tab-close"
					onClick={closeHandler}>
					<CloseIcon />
				</div>
			)}
		</div>
	);
}
export default DragThis(BaseTab);

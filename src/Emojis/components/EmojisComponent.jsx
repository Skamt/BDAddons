import React, { useEffect, useRef, useState } from "@React";
import Flex from "@Components/Flex";
import Button from "@Components/Button";
import { UndoIcon, TrashBinIcon } from "@Components/icon";
import Heading from "@Modules/Heading";
import TextInput from "@Components/TextInput";
import Tooltip from "@Components/Tooltip";
import { ManaTextButton, ManaButton } from "@Components/Button";
import { clsx, copy, debounce } from "@Utils";
import EmojisManager from "@/EmojisManager";
import ErrorBoundary from "@Components/ErrorBoundary";
import GridScroller from "@Components/GridScroller";
import { ModalActions, Modals } from "@Utils/Modals";
import { sendEmojiDirectly, getEmojiUrl, insertEmoji } from "../Utils";
import { ContextMenu } from "@Api";


const c = clsx("emoji-manager");



const rowHeight = 80;
const desiredColumns = 6;
const desiredItemWidth = 80;
const gap = 20;

function getColNumberFromWidth(width, itemWidth, maxColumns) {
	return Math.min(Math.max(Math.floor(width / itemWidth), 1), maxColumns);
}

export default function EmojisComponent() {
	const [val, setValue] = useState("");
	const [width, setWidth] = useState(window.innerWidth * 0.8);
	const ref = useRef();
	const emojis = EmojisManager.emojis.filter((a) => a.name.toLowerCase().includes(val.toLowerCase()));
	// console.log(emojis);

	const changeHandler = (content) => {
		setValue(content);
	};

	useEffect(() => {
		const node = ref.current;
		if (!node) return;

		const overflowListener = () => setWidth(node.clientWidth);
		const resizeObserver = new ResizeObserver(overflowListener);
		resizeObserver.observe(node);

		return () => resizeObserver?.disconnect();
	}, [ref.current]);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		setWidth(node.clientWidth);
	}, [ref.current]);

	const columns = getColNumberFromWidth(width - gap * (desiredColumns - 1), desiredItemWidth, desiredColumns);

	return (
		<div ref={ref} className={c("ref")}>
			<TextInput maxLength={32} size="sm" onChange={changeHandler} value={val} />
			<GridScroller
				style={{ width }}
				className={c("emojis-list")}
				columns={columns}
				itemGutter={gap}
				removeEdgeItemGutters={true}
				getItemKey={(_, index) => emojis[index].id}
				sections={[emojis.length]}
				getItemHeight={() => rowHeight}
				renderItem={(_, index, style) => {
					const emoji = emojis[index];
					return <EmojiCard style={style} key={emoji.id} {...emoji} />;
				}}
			/>
		</div>
	);
}

function EmojiCard({ animated, name, id, style }) {
	const [hover, setHover] = useState(false);
	return (
		<div
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			style={style}
			onContextMenu={(e) => {
				const Menu = ContextMenu.buildMenu([
					{ label: "Send directly", action: () => sendEmojiDirectly(id) },
					{ label: "Copy url", action: () => copy(getEmojiUrl(id)) },
					{ label: "Insert url", action: () => insertEmoji(id) },
					{
						label: "Delete",
						action: () => {
							EmojisManager.remove(id);
							EmojisManager.commit();
						},
					},
				]);
				ContextMenu.open(e, (props) => <Menu {...props} />, {
					position: "bottom",
					align: "left",
				});
			}}
			onClick={() => sendEmojiDirectly(id)}
			className={c("emoji-card", animated && "emoji-card-animated")}
		>
			<Tooltip note={name}>
				<div className={c("emoji-img")}>
					<img alt={name} src={getEmojiUrl(id, hover && animated, 80)} />
				</div>
			</Tooltip>
		</div>
	);
}

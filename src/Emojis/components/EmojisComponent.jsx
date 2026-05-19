import React, { useEffect, useRef, useState } from "@React";
import Flex from "@Components/Flex";
import Button from "@Components/Button";
import { UndoIcon, TrashBinIcon } from "@Components/icon";
import Heading from "@Modules/Heading";
import TextInput from "@Components/TextInput";
import { ManaTextButton, ManaButton } from "@Components/Button";
import { clsx } from "@Utils";
import EmojisManager from "@/EmojisManager";
import ErrorBoundary from "@Components/ErrorBoundary";
import GridScroller from "@Components/GridScroller";
import { ModalActions, Modals } from "@Utils/Modals";
import { sendEmojiDirectly, insertEmoji } from "../Utils";
import { ContextMenu } from "@Api";

const c = clsx("emoji-manager");

function getEmojiUrl(id, animated = false, size = 48) {
	const type = animated ? "gif" : "png";
	return `https://cdn.discordapp.com/emojis/${id}.${type}?size=${size}`;
}

const rowHeight = 80;
const desiredColumns = 6;
const desiredItemWidth = 80;
const gap = 20;

function getColNumberFromWidth(width, itemWidth, maxColumns) {
	return Math.min(Math.max(Math.floor(width / itemWidth), 1), maxColumns);
}

export default function EmojisComponent() {
	const [width, setWidth] = useState(window.innerWidth * 0.8);
	const ref = useRef();
	const emojis = EmojisManager.emojis;

	const columns = getColNumberFromWidth(width - gap * (desiredColumns - 1), desiredItemWidth, desiredColumns);

	useEffect(() => {
		function resize() {
			setWidth(window.innerWidth * 0.8);
		}
		window.addEventListener("resize", resize);
		return () => window.removeEventListener("resize", resize);
	}, []);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		setWidth(node.parentElement.clientWidth);
	}, [ref.current]);

	return (
		<div ref={ref} className={c("ref")}>
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
					{
						id: "Send-directly",
						label: "Send directly",
						action: () => sendEmojiDirectly(id),
					},
					{
						id: "Insert-url",
						label: "Insert url",
						action: () => insertEmoji(id),
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
			<div className={c("emoji-img")}>
				<img alt={name} src={getEmojiUrl(id, hover && animated, 80)} />
			</div>
		</div>
	);
}

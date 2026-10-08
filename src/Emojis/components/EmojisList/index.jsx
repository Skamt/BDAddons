import "./styles";
import EmojisManager from "@/EmojisManager";
import { ContextMenu } from "@Api";
import GridScroller from "@Components/GridScroller";
import TextInput from "@Components/TextInput";
import Heading from "@Components/Heading";
import { MagnifyingGlassIcon } from "@Components/Icon";
import Tooltip from "@Components/Tooltip";
import React, { useSyncExternalStore, useMemo, useEffect, useRef, useState } from "@React";
import { clsx } from "@Utils";
import { getContextMenuItem, getCopyContextMenuItem, buildEmojiUrl, sendDirectly } from "@/Utils";
import Settings from "@Settings";

const c = clsx("emoji-list");

const desiredEmojiSize = 80;
const gap = 12;

function getColNumberFromWidth(width, itemWidth, gap) {
	return Math.floor((width + gap) / (itemWidth + gap));
}

export default function EmojisComponent() {
	const [val, setVal] = useState("");
	const [width, setWidth] = useState(window.innerWidth * 0.8);

	const emojiRenderSize = Settings.emojiRenderSize() || desiredEmojiSize;
	const ref = useRef();
	const scrollerRef = useRef();
	const emojis = useSyncExternalStore(EmojisManager.on, EmojisManager.getEmojis);

	const filteredEmojis = useMemo(() => emojis.filter(a => a.name.toLowerCase().includes(val.toLowerCase())), [emojis, val]);

	const columns = useMemo(() => getColNumberFromWidth(width, emojiRenderSize, gap), [emojiRenderSize, width]);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;

		const overflowListener = () => setWidth(node.clientWidth);
		const resizeObserver = new ResizeObserver(overflowListener);
		resizeObserver.observe(node);

		return () => resizeObserver?.disconnect();
	}, []);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		setWidth(node.clientWidth);
	}, []);

	useEffect(() => {
		scrollerRef?.current?.scrollToTop();
	}, [val]);

	return (
		<div
			ref={ref}
			style={{ "--emoji-size": emojiRenderSize }}
			className={c("container")}>
			{!filteredEmojis.length ? (
				<Heading
					className={c("empty")}
					tag="h1"
					variant="text-md/medium">
					No Saved Emojis
				</Heading>
			) : (
				<>
					<div className={c("header")}>
						<TextInput
							clearable={true}
							autoFocus={true}
							fullWidth={true}
							placeholder="Search Emojis"
							leading={({ color }) => (
								<MagnifyingGlassIcon
									width="16"
									height="16"
									color={color.css ?? color}
								/>
							)}
							onChange={c => setVal(c)}
							value={val}
						/>
					</div>
					<div className={c("body")}>
						<GridScroller
							ref={scrollerRef}
							style={{ width }}
							className={c("emojis-list")}
							columns={columns}
							fade={true}
							itemGutter={gap}
							getItemKey={(_, index) => filteredEmojis[index].id}
							sections={[filteredEmojis.length]}
							getItemHeight={() => emojiRenderSize}
							renderItem={(_, index, style) => {
								const emoji = filteredEmojis[index];
								return (
									<EmojiCard
										style={style}
										key={emoji.id}
										{...emoji}
									/>
								);
							}}
						/>
					</div>
				</>
			)}
		</div>
	);
}

function EmojiCard({ animated, name, id, style }) {
	const [hover, setHover] = useState(false);
	const EmojiContextMenu = useMemo(() => {
		// eslint-disable-next-line @eslint-react/static-components
		const Menu = ContextMenu.buildMenu(
			[
				getContextMenuItem("send", id, animated),
				getContextMenuItem("insert", id, animated),

				getCopyContextMenuItem(id, name),
				{
					label: "Delete",
					action: () => {
						EmojisManager.remove(id);
						EmojisManager.commit();
					}
				}
			].filter(Boolean)
		);
		// eslint-disable-next-line @eslint-react/static-components
		return props => <Menu {...props} />;
	}, [animated, id, name]);

	return (
		<div
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			style={style}
			onContextMenu={e => {
				ContextMenu.open(e, EmojiContextMenu, {
					position: "bottom",
					align: "left"
				});
			}}
			onClick={() => sendDirectly(id)}
			className={c("emoji-card", animated && "emoji-card-animated")}>
			<Tooltip note={name}>
				<div className={c("emoji-img")}>
					<img
						alt={name}
						src={buildEmojiUrl(id, hover && animated, 80)}
					/>
				</div>
			</Tooltip>
		</div>
	);
}

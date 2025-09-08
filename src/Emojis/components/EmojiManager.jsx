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

const c = clsx("emoji-manager");

function getEmojiUrl(id, animated = false, size = 48) {
	const type = animated ? "gif" : "png";
	return `https://cdn.discordapp.com/emojis/${id}.${type}?size=${size}`;
}

// window.id && ModalActions.closeModal(id);
// window.id = ModalActions.openModal(e => (
// 	<ErrorBoundary>
// 		<EmojiManagerComponent
// 			modalProps={e}
// 			emojis={EmojisManager.emojis}
// 		/>
// 	</ErrorBoundary>
// ));

export default function EmojiManagerComponent({ emojis, modalProps }) {
	const state = useRef({});

	const changeHandler = emoji => {
		state.current[emoji.id] = emoji;
	};

	const saveHandler = () => {
		Object.keys(state.current).forEach(id => {
			const { name, deleted } = state.current[id];
			if (deleted) return EmojisManager.remove(id);
			if (name) return EmojisManager.update(id, { name });
		});
		EmojisManager.commit();
		modalProps.onClose();
	};

	return (
		<Modals.ModalRoot
			{...modalProps}
			size="dynamic"
			fullscreenOnMobile={false}
			className={c("modal-root")}>
			<Modals.ModalHeader separator={true}>
				<Heading
					variant="heading-lg/semibold"
					style={{ flexGrow: 1 }}>
					EmojiManager
				</Heading>
				<Modals.ModalCloseButton onClick={modalProps.onClose} />
			</Modals.ModalHeader>
			<div className={c("modal-content")}>
				<EmojisList
					emojis={emojis}
					onChange={changeHandler}
				/>
			</div>
			<Modals.ModalFooter separator={true}>
				<Flex
					style={{ gap: 8 }}
					align={Flex.Align.CENTER}
					justify={Flex.Justify.END}>
					<ManaTextButton
						text="Cancel"
						onClick={modalProps.onClose}
					/>
					<ManaButton
						size="sm"
						text="Save"
						onClick={saveHandler}
					/>
				</Flex>
			</Modals.ModalFooter>
		</Modals.ModalRoot>
	);
}

// const T = s(132748).exports.Z;
const rowHeight = 150;
const desiredColumns = 6;
const desiredItemWidth = 130;
const gap = 20;

function getColNumberFromWidth(width, itemWidth, maxColumns) {
	return Math.min(Math.max(Math.floor(width / itemWidth), 1), maxColumns);
}

function EmojisList({ emojis, onChange }) {
	const [width, setWidth] = useState(window.innerWidth * 0.8);

	const columns = getColNumberFromWidth(width - gap * (desiredColumns - 1), desiredItemWidth, desiredColumns);

	useEffect(() => {
		function resize() {
			setWidth(window.innerWidth * 0.8);
		}
		window.addEventListener("resize", resize);
		return () => window.removeEventListener("resize", resize);
	}, []);

	return (
		<GridScroller
			style={{ width }}
			className={c("emojis-list")}
			columns={columns}
			itemGutter={gap}
			removeEdgeItemGutters={true}
			getItemKey={(_, index) => emojis[index].id}
			sections={[emojis.length]}
			getItemHeight={() => 150}
			renderItem={(_, index, style) => {
				const emoji = emojis[index];
				return (
					<EmojiCard
						onChange={onChange}
						style={style}
						key={emoji.id}
						{...emoji}
					/>
				);
			}}
		/>
	);
}

function EmojiCard({ animated, name, id, style, onChange }) {
	const [val, setValue] = useState(name);
	const [hover, setHover] = useState(false);
	const [deleteEmoji, setDeleteEmoji] = useState(false);

	const changeHandler = name => {
		setValue(name);
		if (name.length < 3) return;
		onChange({ id, name });
	};

	const deleteHandler = () => {
		const del = !deleteEmoji;
		setDeleteEmoji(del);
		onChange({ id, deleted: del });
	};

	return (
		<div
			style={style}
			className={c("emoji-card", deleteEmoji && "emoji-card-deleted", animated && "emoji-card-animated")}>
			<div className={c("emoji-img")} onMouseEnter={()=> setHover(true)} onMouseLeave={()=> setHover(false)}>
				<img
					alt={name}
					src={getEmojiUrl(id, hover && animated, 80)}
				/>
			</div>
			<TextInput
				maxLength={32}
				size="sm"
				disabled={deleteEmoji}
				onChange={changeHandler}
				value={val}
			/>
			<div className={c("btn-delete")}>
				<ManaButton
					onClick={deleteHandler}
					fullWidth={true}
					size="sm"
					variant=""
					icon={() =>
						deleteEmoji ? (
							<UndoIcon
								width="18"
								height="18"
							/>
						) : (
							<TrashBinIcon
								width="18"
								height="18"
							/>
						)
					}
				/>
			</div>
		</div>
	);
}

function EmojiPreview({ id, animated, name = "" }) {
	const [value, setValue] = useState(name);
	useEffect(() => {
		setValue(name);
	}, [name]);
	return (
		<Flex
			grow={0}
			style={{ gap: 20 }}
			direction={Flex.Direction.VERTICAL}
			align={Flex.Align.STRETCH}
			className="emoji-info">
			{/* biome-ignore lint/a11y/useAltText: <explanation> */}
			<div className="emoji-preview">{id && <img src={getEmojiUrl(id, animated, 4096)} />}</div>

			<TextInput
				fullWidth={true}
				// className="emoji-name-input"
				value={value}
				onChange={setValue}
				trailing={() => <PenIcon fill="#ccca" />}
			/>
		</Flex>
	);
}

export function openEmojiManager() {
	ModalActions.openModal(e => (
		<ErrorBoundary>
			<EmojiManagerComponent
				modalProps={e}
				emojis={EmojisManager.emojis}
			/>
		</ErrorBoundary>
	));
}

// import "./styles";
import Store from "@/Store";
import { FolderIcon } from "@Components/Icon";
import React from "@React";
import { clsx, shallow } from "@Utils";
import { join } from "@Utils/String";
import Popout from "@Components/Popout";
import Bookmark from "@/components/Bookmark";
import Heading from "@Modules/Heading";
const c = clsx("folder");

export function SimpleFolder({ items, id, children, position = "bottom", align = "left", onClose }) {
	return (
		<Popout
			position={position}
			align={align}
			spacing={12}
			renderPopout={e => {
				const isEmpty = items.length === 0;

				return (
					<div className="overflow-popout">
						{isEmpty ? (
							<div className={c("empty")}>(Empty)</div>
						) : (
							items.map(item => {
								return item.folderId ? (
									<Folder
										className={c("item")}
										onClose={onClose || e.closePopout}
										position="right"
										align="top"
										key={item.id}
										id={item.folderId}
									/>
								) : (
									<Bookmark
										className={c("item")}
										folderId={id}
										id={item.id}
										key={id}
										onClose={onClose || e.closePopout}
									/>
								);
							})
						)}
					</div>
				);
			}}>
			{children}
		</Popout>
	);
}

export default function Folder({ className, id, position, align, onClose }) {
	const { name, items } = Store(state => Store.getFolder(id), shallow) || {};

	return (
		<SimpleFolder
			position={position}
			align={align}
			id={id}
			items={items}>
			{e => {
				return (
					// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
					<div
						data-id={id}
						className={join(" ", c("container"), "card", className)}
						onClick={e.onClick}>
						<div className={join(" ", c("icon"), "card-icon")}>{<FolderIcon />}</div>
						<div className={join(" ", c("name"), "card-name")}>{name}</div>
					</div>
				);
			}}
		</SimpleFolder>
	);
}

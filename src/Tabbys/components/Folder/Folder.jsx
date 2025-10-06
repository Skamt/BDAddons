// import "./styles";
import Store from "@/Store";
import { FolderIcon } from "@Components/Icon";
import React, { useEffect, useState } from "@React";
import { shallow } from "@Utils";
import Popout from "@Components/Popout";
import FolderPopoutMenu from "./FolderPopoutMenu";
import BaseFolder from "./BaseFolder";
import { makeDraggable } from "@/components/DND/shared";
import { BookmarkSortable, FolderDroppable } from "@/components/DND";
import { DNDTypes } from "@/consts";
import { SettingsButtonStore } from "@/components/SettingsButton";

function Folder({ id, folderId, dropRef, dragRef, ...props }) {
	const { name, items } = Store(state => Store.getFolder(folderId), shallow) || {};
	return (
		<Popout
			position="bottom"
			align="left"
			onRequestOpen={() => SettingsButtonStore.getState().open()}
			onRequestClose={() => SettingsButtonStore.getState().close()}
			spacing={12}
			renderPopout={e => (
				<FolderPopoutMenu
					folderId={folderId}
					items={items}
					onClose={e.closePopout}
				/>
			)}>
			{e => (
				<BaseFolder
					{...props}
					ref={e => dragRef(dropRef(e))}
					id={id}
					channelIds={items.map(a => a.channelId).filter(Boolean)}
					folderId={folderId}
					data-id={id}
					onClick={e.onClick}
					name={name}>
					
					<BookmarkSortable id={id} />
				</BaseFolder>
			)}
		</Popout>
	);
}

export default React.memo(makeDraggable(DNDTypes.FOLDER)(FolderDroppable(Folder)));

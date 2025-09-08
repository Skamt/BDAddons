import { ContextMenu } from "@Api";
import React from "@React";
import { CloseIcon, PlusIcon } from "@Components/Icon";
import {openFolderModal} from "@/components/FolderModal";
import Store from "@/Store";
import { createContextMenuItem } from "./helper";



export default function (id) {
	const Menu = ContextMenu.buildMenu([
		createContextMenuItem(null, "open-bookmark-in-new-tab", () => Store.openBookmark(id), "Open in new Tab", <PlusIcon />), 
		{ type: "separator" }, 
		createContextMenuItem(null, "create-folder", () => openFolderModal(), "Create Folder", <PlusIcon />), 
		{ type: "separator" }, 
		createContextMenuItem(null, "remove-bookmark", () => Store.removeBookmark(id), "Remove Bookmark", <CloseIcon />, "danger")
	]);

	return props => <Menu {...props} />;
}





import { Store } from "@/Store";
import { ContextMenu } from "@Api";
import React from "@React";
import { buildTab } from "@/utils";
import { CloseIcon, PlusIcon } from "@Components/Icon";
import { createContextMenuItem } from "@/utils";
import BookmarksFolderSettingModal from "@/components/BookmarksFolderSettingModal";
import { openModal } from "@Utils/Modals";

function deleteBookmark(id) {
	Store.state.removeBookmark(id);
}

function openInNewTab(id) {
	Store.state.newTab(buildTab(Store.state.getBookmark(id)));
}

function createFolder() {
	openModal(<BookmarksFolderSettingModal variant="create" />, "Tabbys-create-folder");
}

export default function (id) {
	const Menu = ContextMenu.buildMenu([createContextMenuItem(null, "open-bookmark-in-new-tab", () => openInNewTab(id), "Open in new Tab", <PlusIcon />), { type: "separator" }, createContextMenuItem(null, "create-folder", () => createFolder(), "Create Folder", <PlusIcon />), { type: "separator" }, createContextMenuItem(null, "remove-bookmark", () => deleteBookmark(id), "Remove Bookmark", <CloseIcon />, "danger")]);

	return props => (
		<Menu
			{...props}
			className="bookmark-contextmenu"
		/>
	);
}

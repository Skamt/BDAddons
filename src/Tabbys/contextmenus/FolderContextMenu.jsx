import { ContextMenu } from "@Api";
import React from "@React";
import { TrashBinIcon, PenIcon, PlusIcon } from "@Components/Icon";
import { openValueModal } from "@/components/ValueModal";
import Store from "@/Store";
import { createContextMenuItem } from "./helper";

export default function (id) {
	const Menu = ContextMenu.buildMenu([
		createContextMenuItem(
			null,
			"create-folder",
			() =>
				openValueModal({
					title: "Create Folder",
					label: "Folder Name",
					onSubmit: name => name && Store.addFolder(name)
				}),
			"Create Folder",
			PlusIcon
		),
		createContextMenuItem(
			null,
			"edit-folder",
			() => {
				const folder = Store.getFolder(id);
				if (!folder) return;
				openValueModal({
					title: "Edit Folder Name",
					label: "Folder Name",
					placeholder: folder.name,
					initialValue: folder.name,
					onSubmit: name => name && Store.setFolderName(id, name)
				});
			},
			"Edit Folder",
			PenIcon
		),
		{
			type: "separator"
		},
		createContextMenuItem(null, "delete-folder", () => Store.removeFolder(id), "Delete Folder", TrashBinIcon, "danger")
	]);

	return props => <Menu {...props} />;
}

import { getModule } from "@Webpack";
import React, { useEffect, useRef, useState } from "@React";
import { UndoIcon, TrashBinIcon } from "@Components/icon";
import Heading from "@Modules/Heading";

import { ManaTextButton, ManaButton } from "@Components/Button";
import TextInput from "@Components/TextInput";
import { clsx } from "@Utils";
import ErrorBoundary from "@Components/ErrorBoundary";
import { ModalActions, Modals } from "@Utils/Modals";
import { FieldWrapper } from "@Discord/Modules";

const c = clsx("create-folder-modal");
const Modal = getModule(a => a.Modal).Modal;

export default function FolderModal({ modalProps }) {
	const [val, setVal] = useState("");

	const saveHandler = e => {};

	return (
		<Modals.ModalRoot
			{...modalProps}
			// size="medium"
			fullscreenOnMobile={false}
			className={c("root")}>
			<Modals.ModalHeader separator={true}>
				<Heading
					variant="heading-lg/semibold"
					style={{ flexGrow: 1 }}>
					Create Bookmark Folder
				</Heading>
				<Modals.ModalCloseButton onClick={modalProps.onClose} />
			</Modals.ModalHeader>
			<div className={c("content")}>
				<FieldWrapper title="Folder Name">
					<TextInput
						value={val}
						onChange={setVal}
						fullWidth={true}
						placeholder="folder name"
						autoFocus={true}
					/>
				</FieldWrapper>
				<ManaTextButton
					text="reset"
					textVariant="text-sm/medium"
					type="button"
					onClick={() => setVal("")}
				/>
			</div>
			<Modals.ModalFooter
				className={c("footer")}
				separator={true}>
				<ManaButton
					text="Save"
					onClick={saveHandler}
				/>

				<ManaTextButton
					text="Cancel"
					onClick={modalProps.onClose}
				/>
			</Modals.ModalFooter>
		</Modals.ModalRoot>
	);
}

export function openFolderModal(props) {
	ModalActions.openModal(e => (
		<ErrorBoundary>
			<FolderModal
				modalProps={e}
				{...props}
			/>
		</ErrorBoundary>
	));
}

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

export default function ValueModal({ modalProps, title, placeholder, label, initialValue = "", onSubmit }) {
	const [val, setVal] = useState(initialValue);

	const saveHandler = e => {
		onSubmit(val);
		modalProps.onClose?.();
	};

	return (
		<Modals.ModalRoot
			{...modalProps}
			fullscreenOnMobile={false}
			className={c("root")}>
			<Modals.ModalHeader separator={true}>
				<Heading
					variant="heading-lg/semibold"
					style={{ flexGrow: 1 }}>
					{title}
				</Heading>
				<Modals.ModalCloseButton onClick={modalProps.onClose} />
			</Modals.ModalHeader>
			<div className={c("content")}>
				<FieldWrapper title={label}>
					<TextInput
						value={val}
						onChange={setVal}
						fullWidth={true}
						placeholder={initialValue || placeholder}
						autoFocus={true}
					/>
				</FieldWrapper>
				<ManaTextButton
					text="reset"
					textVariant="text-sm/medium"
					type="button"
					onClick={() => setVal(initialValue)}
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

export function openValueModal(props) {
	ModalActions.openModal(e => (
		<ErrorBoundary>
			<ValueModal
				modalProps={e}
				{...props}
			/>
		</ErrorBoundary>
	));
}

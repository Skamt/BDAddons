import "./styles";
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

export default function PromptModal({ modalProps, required, title, placeholder, label, initialValue = "", onSubmit }) {
	const [val, setVal] = useState(initialValue);
	const [submitted, setSubmitted] = useState(false);
	const inputRef = useRef();

	const saveHandler = e => {
		e.preventDefault();
		setSubmitted(true);
		try {
			onSubmit?.(val);
			modalProps.onClose?.();
		} finally {
			setSubmitted(false);
		}
	};

	const resetHandler = () => {
		setVal("");
		inputRef.current.focus();
	};

	return (
		<form onSubmit={saveHandler}>
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
							inputRef={inputRef}
							value={val}
							onChange={setVal}
							fullWidth={true}
							required={required}
							placeholder={placeholder || initialValue}
							autoFocus={true}
						/>
					</FieldWrapper>
					<ManaTextButton
						text="Reset Name"
						textVariant="text-sm/medium"
						type="button"
						onClick={resetHandler}
					/>
				</div>
				<Modals.ModalFooter
					className={c("footer")}
					separator={true}>
					<ManaButton
						text="Save"
						disable={submitted}
						onClick={saveHandler}
					/>
					<ManaTextButton
						text="Cancel"
						onClick={modalProps.onClose}
					/>
				</Modals.ModalFooter>
			</Modals.ModalRoot>
		</form>
	);
}

export function openPromptModal(props) {
	ModalActions.openModal(e => (
		<ErrorBoundary>
			<PromptModal
				modalProps={e}
				{...props}
			/>
		</ErrorBoundary>
	));
}

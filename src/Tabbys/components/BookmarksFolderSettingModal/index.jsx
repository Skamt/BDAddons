import React from "@React";
import { Modals } from "@Utils/Modals";
import TextInput from "@Components/TextInput";
import Button from "@Components/Button";
import { Store } from "@/Store";
import Heading from "@Modules/Heading";
import { buildFolder } from "@/utils";

export default ({ transitionState, onClose, variant }) => {
	const [val, setVal] = React.useState("");

	const clickHandler = () => {
		Store.state.addBookmark(buildFolder({ name: val }));
		onClose();
	};

	const { title, label } = {
		create: { title: "Add Folder", label: "Folder Name" },
		edit: { title: "Edit Folder", label: "Folder Name" }
	}[variant];

	return (
		<Modals.ModalRoot
			transitionState={transitionState}
			animation={Modals.Animations.SUBTLE}>
			<Modals.ModalHeader>
				<Heading variant="heading-lg/semibold">{title}</Heading>
			</Modals.ModalHeader>
			<Modals.ModalContent>
				<Heading
					tag="h5"
					style={{ marginBottom: 8 }}
					variant="eyebrow">
					{label}
				</Heading>
				<TextInput
					onChange={setVal}
					value={val}
				/>
				<Button
					style={{ marginTop: 8, padding: 0 }}
					onClick={() => setVal("")}
					color={Button.Colors.LINK}
					look={Button.Looks.LINK}
					size={Button.Sizes.NONE}>
					Reset
				</Button>
			</Modals.ModalContent>
			<Modals.ModalFooter>
				<Button onClick={clickHandler}>Save</Button>
				<Button
					onClick={onClose}
					color={Button.Colors.PRIMARY}
					look={Button.Looks.LINK}>
					Cancel
				</Button>
			</Modals.ModalFooter>
		</Modals.ModalRoot>
	);
};

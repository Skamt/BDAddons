module.exports = ({ props, user }) => {
	const [value, setValue] = useState(Data.load(user.id) || "");

	const saveHandler = () => {
		try {
			Data.save(user.id, value);
			props.onClose();
			Utils.showToast(`Nickname ${value} for ${user.username} Has been saved.`,"success");
		} catch (e) {
			Utils.showToast(`Error occured while saving nickname, Check the console for more info.`,"danger");			
			console.error(e);
		}
	};

	const clearHandler = () => setValue("");

	return (
		<ModalRoot {...props}>
			<ModalHeader separator={false}>
				<Text
					children="Add User Nickname"
					variant="heading-lg/semibold"
				/>
			</ModalHeader>
			<ModalBody>
				<Text
					children="Find a friend faster with a personal nickname. It will only be visible to you in your direct messages."
					className="description-2pRfjZ"
					variant="text-md/normal"
				/>
				<Label children="User Nickname" />
				<Textbox
					{...Textbox.defaultProps}
					className="input-2i7ay7"
					autoFocus={true}
					placeholder={user.username}
					onChange={setValue}
					value={value}
				/>
				<ButtonData
					children="Reset user nickname"
					className="reset-Gp82ub"
					size=""
					onClick={clearHandler}
					color={ButtonData.Colors.LINK}
					look={ButtonData.Looks.LINK}
				/>
			</ModalBody>
			<ModalFooter>
				<ButtonData
					children="Save"
					onClick={saveHandler}
				/>

				<ButtonData
					children="Cancel"
					onClick={props.onClose}
					color={ButtonData.Colors.PRIMARY}
					look={ButtonData.Looks.LINK}
				/>
			</ModalFooter>
		</ModalRoot>
	);
};

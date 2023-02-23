module.exports = ({ props, user }) => {
	const [value, setValue] = useState(Data.load(user.id) || "");

	useEffect(() => {
		const keyupHandler = e => e.key === "Enter" && Save();
		document.addEventListener("keyup", keyupHandler);
		return () => document.removeEventListener("keyup", keyupHandler);
	}, []);
	const Save = () => {
		try {
			Data.save(user.id, value);
			props.onClose();
			Utils.showToast(`Nickname ${value} for ${user.username} Has been saved.`, "success");
		} catch (e) {
			console.error(e);
			props.onClose();
			Utils.showToast(`Error occured while saving nickname, Check the console for more info.`, "danger");
			require('electron').ipcRenderer.send('bd-toggle-devtools');
		}
	};

	const Clear = () => setValue("");

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
					onClick={Clear}
					color={ButtonData.Colors.LINK}
					look={ButtonData.Looks.LINK}
				/>
			</ModalBody>
			<ModalFooter>
				<ButtonData
					children="Save"
					onClick={Save}
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

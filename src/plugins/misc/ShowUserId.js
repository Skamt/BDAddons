new class ShowUserId extends Disposable {
	Init() {
		this.patches = [
			Patcher.after(MessageHeader, "Z", (_, [{ message }], ret) => {
				ret.props.children.push(React.createElement('span', {
					onClick: () => Utils.copy(message.author.id),
					className: "id"
				}, message.author.id))
			})
		];
	}
}
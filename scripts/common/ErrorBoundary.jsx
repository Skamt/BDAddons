module.exports = class ErrorBoundary extends React.Component {
	state = { hasError: false, error: null, info: null };

	componentDidCatch(error, info) {
		this.setState({ error, info, hasError: true });
		const errorMessage = `\t${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
		console.error(`%c[${this.props.plugin}] %cthrew an exception at %c[${this.props.id}]\n`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
		this.props.closeModal?.();
		BdApi.showConfirmationModal(
			`Plugin: ${this.props.plugin}`,
			<p style={{ fontWeight: "bold", color: "#e0e1e5" }}>
				An error has occured while rendering <span style={{ fontWeight: "bold", color: "orange" }}>{this.props.id}</span>
			</p>,
			{
				confirmText: "Open Console",
				cancelText: "Close",
				onConfirm: () => this.openDevTools()
			}
		);
	}

	openDevTools() {
		try {
			require("electron").ipcRenderer.send("bd-open-devtools");
		} catch {
			BdApi.alert("Encountered an error while opening the console.");
		}
	}

	render() {
		return this.state.hasError ? null : this.props.children;
	}
};

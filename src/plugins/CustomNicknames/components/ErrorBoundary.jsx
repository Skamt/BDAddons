class ErrorBoundary extends React.Component {
	state = { hasError: false, error: null, info: null };
	
	componentDidCatch(error, info) {
		this.setState({ error, info, hasError: true });
		const errorMessage = `\n\t${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
		console.error(`%c[${this.props.plugin}] %cthrew an exception at %c[${this.props.id}]\n`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
		this.props?.closeModal?.();
		BdApi.alert(
			this.props.plugin,
			<p style={{ fontWeight: "bold", color: "#e0e1e5" }}>
				An error has occured while rendering <span style={{ fontWeight: "bold", color: "orange" }}>{this.props.id}</span>
			</p>
		);
	}

	render() {
		return this.state.hasError ? null : this.props.children;
	}
};

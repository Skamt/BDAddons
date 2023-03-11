class ErrorBoundary extends React.Component {
	state = { hasError: false, error: null, info: null };
	componentDidCatch(error, info) {
		this.setState({ error, info, hasError: true });
		const errorMessage = `\n\t${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
		console.error(`%c[${this.props.plugin}] %cthrew an exception at %c[${this.props.id}]\n`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div id={CLASS_NAME} className={`EB-${this.props.plugin}-${this.props.id}`}>
					<div className="logo"></div>
					<div className="title">An error has occured while rendering <span style={{ fontWeight: "bold", color: "orange" }}>{this.props.id}</span></div>
					<div className="description">Open console for more information</div>
				</div>
			);
		}
		return this.props.children;
	}
};

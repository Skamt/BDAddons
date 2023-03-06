module.exports = class ErrorBoundary extends React.Component {
	state = { hasError: false, error: null, info: null };
	className = `EB-${this.props.plugin}-${this.props.id}`;
	
	componentDidCatch(error, info) {
		this.setState({ error, info, hasError: true });
		const errorMessage = `\t${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
		console.error(`%c[${this.props.plugin}] %cthrew an exception at %c[${this.props.id}]\n`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
	}

	onClick() {
		this.props?.closeModal?.();
		BdApi.alert(
			this.props.plugin,
			<p style={{ fontWeight: "bold", color: "#e0e1e5" }}>
				An error has occured while rendering <span style={{ fontWeight: "bold", color: "orange" }}>{this.props.id}</span>
			</p>
		);
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				this.props.fallback.props.className = this.className;
				this.props.fallback.props.onClick = () => this.onClick();
				return this.props.fallback;
			}
			return React.createElement("div", {
				onClick: () => this.onClick(),
				className: this.className,
				children: "An error has occured, Click for more info."
			});
		}
		return this.props.children;
	}
};

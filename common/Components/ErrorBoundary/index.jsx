import { React } from "@Api";

export default class ErrorBoundary extends React.Component {
	state = { hasError: false, error: null, info: null };
	
	componentDidCatch(error, info) {
		this.setState({ error, info, hasError: true });
		const errorMessage = `\n\t${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
		console.error(`%c[${config?.info?.name || "Unknown Plugin"}] %cthrew an exception at %c[${this.props.id}]\n`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
	}

	renderErrorBoundary() {
		return (
			<div style={{ background: "#292c2c", padding: "20px", borderRadius: "10px" }}>
				<b style={{ color: "#e0e1e5" }}>
					An error has occured while rendering <span style={{ color: "orange" }}>{this.props.id}</span>
				</b>
			</div>
		);
	}

	renderFallback() {
		if (React.isValidElement(this.props.fallback)) {
			if (this.props.passMetaProps)
				this.props.fallback.props = {
					id: this.props.id,
					plugin: config?.info?.name || "Unknown Plugin",
					...this.props.fallback.props
				};
			return this.props.fallback;
		}
		return (
			<this.props.fallback
				id={this.props.id}
				plugin={config?.info?.name || "Unknown Plugin"}
			/>
		);
	}

	render() {
		if (!this.state.hasError) return this.props.children;
		return this.props.fallback ? this.renderFallback() : this.renderErrorBoundary();
	}
}

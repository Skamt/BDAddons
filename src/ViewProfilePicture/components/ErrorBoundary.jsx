import { React } from "@Api";

export default class ErrorBoundary extends React.Component {
	state = { hasError: false, error: null, info: null };

	componentDidCatch(error, info) {
		this.setState({ error, info, hasError: true });
		const errorMessage = `\n\t${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
		console.error(`%c[${this.props.plugin}] %cthrew an exception at %c[${this.props.id}]\n`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) return this.props.fallback;
			else {
				return (
					<div style={{ background: "#292c2c", padding: "20px", borderRadius:"10px" }}>
						<b style={{ color: "#e0e1e5" }}>
							An error has occured while rendering <span style={{ color: "orange" }}>{this.props.id}</span>
						</b>
					</div>
				);
			}
		} else return this.props.children;
	}
}
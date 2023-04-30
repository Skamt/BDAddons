import { React } from "@Api";

export default class ErrorBoundary extends React.Component {
	state = { hasError: false, error: null, info: null };
		
	componentDidCatch(error, info) {
		this.setState({ error, info, hasError: true });
		const errorMessage = `\n\t${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
		console.error(`%c[${this.props.plugin}] %cthrew an exception at %c[${this.props.id}]\n`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
	}

	render() {	
		return this.state.hasError ? (this.props.fallback || <b style={{color:"red"}}>Error occured while rendering</b>) : this.props.children;
	}
};

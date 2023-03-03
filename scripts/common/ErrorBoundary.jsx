module.exports = class ErrorBoundary extends React.Component {
	state = { hasError: false, error: null, info: null };

	componentDidCatch(error, info) {
		this.setState({ error, info, hasError: true });
		console.error(`[ErrorBoundary:${this.props.id}].\n`, error);
	}

	render() {
		console.log(this.state);
		if (this.state.hasError) {
			return this.props.mini ? (
				<span style={{ "color": "red", "fontWeight": "bold" }}>{this.props.id} Error, open the console.</span>
			) : (
				<div className="errorBoundary">
					<style>{`.errorBoundary {
	user-select: none;
	padding: 0;
	border: 0;
	display: flex;
	flex-direction: column;
	background-color: #313338;
	border-radius: 4px;
	margin: 0 auto;
	position: relative;
	height: 600px;
}

.errorBoundary > .header {
	display: flex;
	align-items: center;
	justify-content: flex-start;
	flex-wrap: nowrap;
	flex-direction: row;
	position: relative;
	padding: 16px;
	z-index: 1;
	border-radius: 4px 4px 0 0;
	background-color: #2b2d31 ;
}

.errorBoundary > .header > .title {
	margin: 0;
	padding: 0;
	border: 0;
	font-family: "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
	font-size: 1.5rem;
	color: rgb(243, 244, 245);
}

.errorBoundary > .body {
	flex: 1 1 auto;
	min-height:0;
	position: relative;
	z-index: 0;
	border-radius: 5px 5px 0 0;
	display:flex;
	flex-direction:column;
	height:100%;
}

.errorBoundary > .body > .info {
	color: #e0e1e5;
	font-weight: bold;
	font-family: "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
	margin-bottom: 16px;
	margin-left: 20px;
}

.errorBoundary > .body > .info > .errorId{
	color: #e0e1e5;
	font-weight: bold;
	font-family: "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
	margin-left: 5px;
	color:orange;
}

.errorBoundary > .body > .stack {
	color: #e0e1e5;
	font-size: 16px;
	line-height: 20px;
	margin: 0 0 0 0;
	overflow: hidden auto;
	flex:1;
}

.errorBoundary > .footer {
	display: flex;
	align-items: stretch;
	justify-content: flex-start;
	flex-wrap: nowrap;
	flex-direction: row-reverse;
	position: relative;
	padding: 16px;
	z-index: 1;
	overflow-x: hidden;
	border-radius: 0 0 5px 5px;
	background-color:#2b2d31;
	flex: 0 0 auto;
}

.errorBoundary > .footer > .closeBtn {
	box-sizing: border-box;
	border: none;
	border-radius: 3px;
	font-size: 14px;
	min-width: 96px;
	min-height: 38px;
	color: #fff;
	background-color: #5865f2;
}
`}</style>
					<div className="header">
						<h1 className="title">Error {config.info.name}</h1>
					</div>
					<div className="body">
						<p className="info">
							An error has occured while rendering <span className="errorId">{this.props.id}</span>
						</p>
						<pre className="stack">
							{this.state.error || ""}
							<br />
							{this.state.info.componentStack || ""}
						</pre>
					</div>
					<div className="footer">
						<button className="closeBtn">Close</button>
					</div>
				</div>
			);
		}
		return this.props.children;
	}
};

import { React } from "@Api";
import Button from "@Modules/Button";

export default Button ||
	function ButtonComponentFallback(props) {
		return <button {...props}></button>;
	};

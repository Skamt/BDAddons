import { React } from "@Api";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

export default TheBigBoyBundle.Button ||
	function ButtonComponentFallback(props) {
		return <button {...props}></button>;
	};

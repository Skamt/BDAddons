import React from "@React";
import { HideTitleContext } from "./context";

export default function Markup({ icon, title }) {
	const hideTitle = React.useContext(HideTitleContext);
	return (
		<>
			{icon}
			{!hideTitle && <div className="card-title">{title}</div>}
		</>
	);
}

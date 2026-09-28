import React, { use } from "@React";
import { HideTitleContext } from "./context";

export default function Markup({ icon, title }) {
	const hideTitle = use(HideTitleContext);
	return (
		<>
			{icon}
			{!hideTitle && <div className="card-title">{title}</div>}
		</>
	);
}

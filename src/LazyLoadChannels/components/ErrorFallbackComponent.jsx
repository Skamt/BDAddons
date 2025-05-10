import React from "@React";

import { COMPONENT_ID } from "../Constants";

export default props => {
	return (
		<div id={COMPONENT_ID}>
			<div className="logo"></div>
			<div className="title">
				An error has occured while rendering <span style={{ fontWeight: "bold", color: "orange" }}>{props.id}</span>
			</div>
			<div className="description">Open console for more information</div>
		</div>
	);
};

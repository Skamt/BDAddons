import React, { useState, useEffect } from "@React";
import { getModule, reactRefMemoFilter } from "@Webpack";
import { getUserName } from "@Utils/User";

import Tooltip from "@Components/Tooltip";
const TypingDots = getModule(reactRefMemoFilter("type", "dotRadius", "className"), { searchExports: true });

export default function ({ users }) {
	const typingUsersNames = users?.map(getUserName).join(", ");

	return (
		<Tooltip note={typingUsersNames}>
			<div className="typing-dots">
				<TypingDots dotRadius={2.5} />
			</div>
		</Tooltip>
	);
}

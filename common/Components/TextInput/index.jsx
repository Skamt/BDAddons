import React from "@React";
import { Filters, getModule } from "@Webpack";
const TextInput = getModule(Filters.byStrings("showCharacterCount", "clearable"), { searchExports: true });

export default TextInput ||
	function TextInputFallback(props) {
		return (
			<div style={{ color: "#fff" }}>
				<input
					{...props}
					type="text"
					onChange={e => props.onChange?.(e.target.value)}
				/>
			</div>
		);
	};

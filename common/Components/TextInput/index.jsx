import { React } from "@Api";
import { getModule } from "@Webpack";
const TextInput = getModule(a => a?.prototype?.render?.toString().includes(`ClassName:a,inputPrefix:o,disabled:l,size:u,editable:d,inputRef:f,prefixElement:_,focusProps:p}=n,m=y(n,["className","inputClassName","inputPrefix","disabled","size","edita`), { searchExports: true });

export default TextInput ||
	function TextInputFallback(props) {
		return (
			<div style={{ color: "#fff" }}>
				{props.children}
				<input
					type="text"
					value={props.value}
					onChange={e => props.onChange(e.target.value)} />
			</div>
		);
	};

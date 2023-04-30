import { React } from "@Api";
import { copy, showToast } from "@Utils";

export default ({ href }) => {
	return (
		<>
			<span className="copyBtnSpan">|</span>
			<a
				className="copyBtn"
				onClick={() => {
					copy(href);
					showToast("Link Copied!", "success");
				}}>
				Copy link
			</a>
		</>
	);
};

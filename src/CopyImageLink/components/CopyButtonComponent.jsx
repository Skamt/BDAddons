// eslint-disable-next-line no-unused-vars
import { React } from "@Api";
import { copy } from "@Utils";
import Toast from "@Utils/Toast";

// eslint-disable-next-line react/display-name
export default ({ href }) => {
    return (
        <>
            <span className="copyBtnSpan">|</span>
            <a
                className="copyBtn"
                onClick={() => {
                    copy(href);
                    Toast.success("Link Copied!");
                }}>
                Copy link
            </a>
        </>
    );
};

import React from "@React";
import { copy } from "@Utils";
import Toast from "@Utils/Toast";

export default ({ href }) => {
    return (
        <>
            <span className="copyBtnSpan">|</span>
            <a
                className="copyBtn"
                onClick={e => {
                	e.stopPropagation();
                    copy(href);
                    Toast.success("Link Copied!");
                }}>
                Copy link
            </a>
        </>
    );
};

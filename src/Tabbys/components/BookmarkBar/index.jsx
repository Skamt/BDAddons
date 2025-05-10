import "./styles";
import { Store } from "@/Store";
import React from "@React";

export default function BookmarkBar() {
		const bookmarks = Store(Store.selectors.bookmarks, (a, b) => a.length === b.length && !a.some((_, i) => a[i].id !== b[i].id));

		return <div className="bookmarks-container"></div>;
}

import React, { useEffect, useState } from "@React";
import SubFolder from "./SubFolder";
import { SubBookmark } from "@/components/Bookmark";
import { classNameFactory, join } from "@Utils/css";

const c = classNameFactory("folder");

export default function FolderPopoutMenu({ folderId, items, onClose }) {
	const isEmpty = items.length === 0;

	return (
		<div className="overflow-popout">
			{isEmpty ? (
				<div className={c("empty")}>(Empty)</div>
			) : (
				items.map(item => {
					return item.folderId ? (
						<SubFolder
							onClose={onClose || e.closePopout}
							parentId={folderId}
							folderId={item.folderId}
							id={item.id}
							key={item.id}
						/>
					) : (
						<SubBookmark
							onClose={onClose || e.closePopout}
							parentId={folderId}
							id={item.id}
							key={item.id}
						/>
					);
				})
			)}
		</div>
	);
}

import {  getModule, Filters } from "@Webpack";

export const DragSource = () => getModule(Filters.byStrings("drag-source", "collect"), { searchExports: true });
Modules.add("DragSource", DragSource);
export const DropTarget = () => getModule(Filters.byStrings("drop-target", "collect"), { searchExports: true });
Modules.add("DragSource", DragSource);


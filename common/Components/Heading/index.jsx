import React from "@React";
import { getModule, Filters } from "@Webpack";
import { getInObject } from "@Utils/Object";

const Heading = getInObject(getModule(Filters.bySource('text":', 'headin":', "data-excessive-heading-level", "heading-sm/normal")), Filters.byStrings("data-excessive-heading-level"));

export default Heading || function ({ tag, ...rest }) {return React.createElement(tag, rest);}


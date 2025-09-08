import { React } from "@Api";
import { getModule, Filters } from "@Webpack";
import Button from "@Modules/Button";

function ButtonComponentFallback(props) {
	return <button {...props} />;
}

export const ManaButton = /*@__PURE__*/ getModule(Filters.byStrings(`"data-mana-component":"button"`), { searchExports: true }) || ButtonComponentFallback;
export const ManaTextButton = /*@__PURE__*/ getModule(Filters.byStrings(`"data-mana-component":"text-button"`), { searchExports: true }) || ButtonComponentFallback;

export default Button || ButtonComponentFallback;

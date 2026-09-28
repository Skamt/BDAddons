import Plugin from "@common/Plugin";
import {getDeclarationAndKey, Filters} from "@Webpack";
import {after, before} from "@common/Patcher";
// const [exp, key] = getDeclarationAndKey(Filters.bySource("TypingUsers", "typingUsers"), Filters.byStrings("TypingUsers", "typingUsers"));


Plugin.onStart(() => {
	
	
});



module.exports = () => Plugin;

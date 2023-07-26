const chunkName = Object.keys(window).find(key => key.startsWith("webpackChunk"));
const chunk = window[chunkName];
export default chunk.push([[Symbol()], {}, r => r]);
chunk.pop();

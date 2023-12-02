const chunkName = Object.keys(window).find(key => key.startsWith("webpackChunk"));
const chunk = window[chunkName];
let webpackreq;
chunk.push([[Symbol()], {}, r => webpackreq = r]);
chunk.pop();
export default webpackreq;
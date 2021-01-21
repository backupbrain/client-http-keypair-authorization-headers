"use strict";class HttpKeyPairAuthorizer{static get KEY_TYPE_PUBLIC(){return"public"}static get KEY_TYPE_PRIVATE(){return"private"}static createDigest(e,t){return new Promise((r=>{var i=new TextEncoder;window.crypto.subtle.digest(t,i.encode(e)).then((e=>{var t=window.btoa(String.fromCharCode.apply(null,new Uint8Array(e)));r(t)}))}))}static createDigestHeader(e,t){return new Promise((r=>{this.createDigest(e,t).then((e=>{var i=`${t.toUpperCase()}=${e}`;r(i)}))}))}static createSigningMessage(e,t=null){var r=e.headers,i=[];if(t.headers&&t.headers.length>0)for(var a=t.headers,s=0;s<a.length;s++){var o=a[s];if("("===o[0])if("(request-target)"===o){var n=this.__getRequestTarget(e);i.push(`${o}: ${n}`)}else{var h=o.substring(1,o.length-1);i.push(`${o}: ${t[h]}`)}else{h=o.toLowerCase().split("-").map(((e,t)=>e.replace(e[0],e[0].toUpperCase()))).join("-");i.push(`${o}: ${r[h]}`)}}else{if(!r||!r.Date)throw Error('If no authorizationParameters.headers are specified, a "Date" HTTP header must exist to create');i.push(`date: ${r.Date}`)}return i.join("\n")}static createMessageSignature(e,t,r){var i=r.algorithmParameters,a=this.createSigningMessage(e,r),s=new TextEncoder;return new Promise((e=>{window.crypto.subtle.sign(i,t,s.encode(a)).then((t=>{var r=window.btoa(String.fromCharCode.apply(null,new Uint8Array(t)));e(r)}))}))}static createAuthorizationHeader(e,t,r){return new Promise((i=>{this.createMessageSignature(e,t,r).then((e=>{var t=e;console.log("signature"),console.log(t);var a={},s="";if(r){for(var o in r)"headers"!==o&&"algorithmParameters"!==o&&(a[o]=r[o]);r.headers&&(s=r.headers.map(((e,t)=>e)).join(" "))}console.log(r),"SHA-1"===r.algorithmParameters.hash?a.algorithm="RSA-SHA1":"SHA-256"===r.algorithmParameters.hash?a.algorithm="RSA-SHA256":"SHA-384"===r.algorithmParameters.hash?a.algorithm="RSA-SHA384":"SHA-512"===r.algorithmParameters.hash&&(a.algorithm="RSA-SHA512"),a.signature=t,"Date"!==s&&(a.headers=s);var n=`Signature ${Object.keys(a).map(((e,t)=>{var r=a[e];return"string"==typeof r?`${e}="${r}"`:`${e}=${r}`})).join(",")}`;console.log(n),i(n)}))}))}static digestHttpRequest(e,t){return new Promise((r=>{e.headers.Digest=this.createDigestHeader(e.body,t),r(e)}))}static signHttpRequest(e,t,r,i=null){return i?new Promise((a=>{console.log(r),this.createDigestHeader(e.body,i).then((i=>{e.headers.Digest=i,this.signHttpRequestAfterDigest(e,t,r).then((t=>{a(e)}))}))})):this.signHttpRequestAfterDigest(e,t,r)}static signHttpRequestAfterDigest(e,t,r){return new Promise((i=>{this.createAuthorizationHeader(e,t,r).then((t=>{e.headers.Authorization=t,e.headers.Signature=t,i(e)}))}))}static __getRequestTarget(e){return`${e.method.toLowerCase()} ${e.path}`}static __arrayBufferToString(e){return String.fromCharCode.apply(null,new Uint8Array(e))}static __stringToArrayBuffer(e){var t=new ArrayBuffer(e.length),r=new Uint8Array(t);for(let t=0,i=e.length;t<i;t++)r[t]=e.charCodeAt(t);return t}static __addNewlines(e,t){let r="";for(;e.length>0;)r+=e.substring(0,t)+"\n",e=e.substring(t);return r}static exportPrivateKeyToPemString(e){return this.__exportKeyToPemString(HttpKeyPairAuthorizer.KEY_TYPE_PRIVATE,e)}static exportPublicKeyToPemString(e){return this.__exportKeyToPemString(HttpKeyPairAuthorizer.KEY_TYPE_PUBLIC,e)}static __exportKeyToPemString(e,t){if(![HttpKeyPairAuthorizer.KEY_TYPE_PUBLIC,HttpKeyPairAuthorizer.KEY_TYPE_PRIVATE].includes(e))throw Error("Invalid key format. Must be HttpKeyPairAuthorizer.KEY_TYPE_PUBLIC or HttpKeyPairAuthorizer.KEY_TYPE_PRIVATE");var r="",i="";return e===HttpKeyPairAuthorizer.KEY_TYPE_PUBLIC?(r="PUBLIC",i="spki"):(r="PRIVATE",i="pkcs8"),new Promise((e=>{window.crypto.subtle.exportKey(i,t).then((t=>{var i=t,a=this.__arrayBufferToString(i),s=window.btoa(a),o=this.__addNewLines(s);e(`-----BEGIN ${r} KEY-----\n${o}-----END ${r} KEY-----`)}))}))}static importPrivateKeyFromPemString(e,t){return this.__importKeyFromPemString(HttpKeyPairAuthorizer.KEY_TYPE_PRIVATE,e,t)}static importPublicKeyFromPemString(e,t){return this.__importKeyFromPemString(HttpKeyPairAuthorizer.KEY_TYPE_PUBLIC,e,t)}static __importKeyFromPemString(e,t,r){if(![HttpKeyPairAuthorizer.KEY_TYPE_PUBLIC,HttpKeyPairAuthorizer.KEY_TYPE_PRIVATE].includes(e))throw Error("Invalid key format. Must be HttpKeyPairAuthorizer.KEY_TYPE_PUBLIC or HttpKeyPairAuthorizer.KEY_TYPE_PRIVATE");var i=[],a="";e===HttpKeyPairAuthorizer.KEY_TYPE_PUBLIC?(i.push("verify"),a="spki"):(i.push("sign"),a="pkcs8");var s=t.replace(/-{5}(BEGIN|END)([A-Z ]*)KEY-{5}?/g,""),o=window.atob(s),n=this.__stringToArrayBuffer(o);return new Promise(((e,t)=>{window.crypto.subtle.importKey(a,n,r,!0,i).then((t=>{e(t)})).catch((()=>{throw Error("Error processing your PEM string into a CryptoKey. Your PEM format is likely incompatible. Make sure it PKCS #8 compatible")}))}))}}

var xe=Object.defineProperty;var f=(n,i)=>()=>(n&&(i=n(n=0)),i);var we=(n,i)=>{for(var t in i)xe(n,t,{get:i[t],enumerable:!0})};var W,Y,rt,Mt,P,Ft,w,Rt,nt,at=f(()=>{W=globalThis,Y=W.ShadowRoot&&(W.ShadyCSS===void 0||W.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,rt=Symbol(),Mt=new WeakMap,P=class{constructor(i,t,e){if(this._$cssResult$=!0,e!==rt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=i,this.t=t}get styleSheet(){let i=this.o,t=this.t;if(Y&&i===void 0){let e=t!==void 0&&t.length===1;e&&(i=Mt.get(t)),i===void 0&&((this.o=i=new CSSStyleSheet).replaceSync(this.cssText),e&&Mt.set(t,i))}return i}toString(){return this.cssText}},Ft=n=>new P(typeof n=="string"?n:n+"",void 0,rt),w=(n,...i)=>{let t=n.length===1?n[0]:i.reduce((e,o,s)=>e+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+n[s+1],n[0]);return new P(t,n,rt)},Rt=(n,i)=>{if(Y)n.adoptedStyleSheets=i.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of i){let e=document.createElement("style"),o=W.litNonce;o!==void 0&&e.setAttribute("nonce",o),e.textContent=t.cssText,n.appendChild(e)}},nt=Y?n=>n:n=>n instanceof CSSStyleSheet?(i=>{let t="";for(let e of i.cssRules)t+=e.cssText;return Ft(t)})(n):n});var Ee,Ce,Ae,Se,ke,Te,q,Pt,Me,Fe,H,lt,zt,Ht,b,K=f(()=>{at();at();({is:Ee,defineProperty:Ce,getOwnPropertyDescriptor:Ae,getOwnPropertyNames:Se,getOwnPropertySymbols:ke,getPrototypeOf:Te}=Object),q=globalThis,Pt=q.trustedTypes,Me=Pt?Pt.emptyScript:"",Fe=q.reactiveElementPolyfillSupport,H=(n,i)=>n,lt={toAttribute(n,i){switch(i){case Boolean:n=n?Me:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,i){let t=n;switch(i){case Boolean:t=n!==null;break;case Number:t=n===null?null:Number(n);break;case Object:case Array:try{t=JSON.parse(n)}catch{t=null}}return t}},zt=(n,i)=>!Ee(n,i),Ht={attribute:!0,type:String,converter:lt,reflect:!1,useDefault:!1,hasChanged:zt};Symbol.metadata??=Symbol("metadata"),q.litPropertyMetadata??=new WeakMap;b=class extends HTMLElement{static addInitializer(i){this._$Ei(),(this.l??=[]).push(i)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(i,t=Ht){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(i)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(i,t),!t.noAccessor){let e=Symbol(),o=this.getPropertyDescriptor(i,e,t);o!==void 0&&Ce(this.prototype,i,o)}}static getPropertyDescriptor(i,t,e){let{get:o,set:s}=Ae(this.prototype,i)??{get(){return this[t]},set(r){this[t]=r}};return{get:o,set(r){let l=o?.call(this);s?.call(this,r),this.requestUpdate(i,l,e)},configurable:!0,enumerable:!0}}static getPropertyOptions(i){return this.elementProperties.get(i)??Ht}static _$Ei(){if(this.hasOwnProperty(H("elementProperties")))return;let i=Te(this);i.finalize(),i.l!==void 0&&(this.l=[...i.l]),this.elementProperties=new Map(i.elementProperties)}static finalize(){if(this.hasOwnProperty(H("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(H("properties"))){let t=this.properties,e=[...Se(t),...ke(t)];for(let o of e)this.createProperty(o,t[o])}let i=this[Symbol.metadata];if(i!==null){let t=litPropertyMetadata.get(i);if(t!==void 0)for(let[e,o]of t)this.elementProperties.set(e,o)}this._$Eh=new Map;for(let[t,e]of this.elementProperties){let o=this._$Eu(t,e);o!==void 0&&this._$Eh.set(o,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(i){let t=[];if(Array.isArray(i)){let e=new Set(i.flat(1/0).reverse());for(let o of e)t.unshift(nt(o))}else i!==void 0&&t.push(nt(i));return t}static _$Eu(i,t){let e=t.attribute;return e===!1?void 0:typeof e=="string"?e:typeof i=="string"?i.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(i=>this.enableUpdating=i),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(i=>i(this))}addController(i){(this._$EO??=new Set).add(i),this.renderRoot!==void 0&&this.isConnected&&i.hostConnected?.()}removeController(i){this._$EO?.delete(i)}_$E_(){let i=new Map,t=this.constructor.elementProperties;for(let e of t.keys())this.hasOwnProperty(e)&&(i.set(e,this[e]),delete this[e]);i.size>0&&(this._$Ep=i)}createRenderRoot(){let i=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Rt(i,this.constructor.elementStyles),i}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(i=>i.hostConnected?.())}enableUpdating(i){}disconnectedCallback(){this._$EO?.forEach(i=>i.hostDisconnected?.())}attributeChangedCallback(i,t,e){this._$AK(i,e)}_$ET(i,t){let e=this.constructor.elementProperties.get(i),o=this.constructor._$Eu(i,e);if(o!==void 0&&e.reflect===!0){let s=(e.converter?.toAttribute!==void 0?e.converter:lt).toAttribute(t,e.type);this._$Em=i,s==null?this.removeAttribute(o):this.setAttribute(o,s),this._$Em=null}}_$AK(i,t){let e=this.constructor,o=e._$Eh.get(i);if(o!==void 0&&this._$Em!==o){let s=e.getPropertyOptions(o),r=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:lt;this._$Em=o;let l=r.fromAttribute(t,s.type);this[o]=l??this._$Ej?.get(o)??l,this._$Em=null}}requestUpdate(i,t,e,o=!1,s){if(i!==void 0){let r=this.constructor;if(o===!1&&(s=this[i]),e??=r.getPropertyOptions(i),!((e.hasChanged??zt)(s,t)||e.useDefault&&e.reflect&&s===this._$Ej?.get(i)&&!this.hasAttribute(r._$Eu(i,e))))return;this.C(i,t,e)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(i,t,{useDefault:e,reflect:o,wrapped:s},r){e&&!(this._$Ej??=new Map).has(i)&&(this._$Ej.set(i,r??t??this[i]),s!==!0||r!==void 0)||(this._$AL.has(i)||(this.hasUpdated||e||(t=void 0),this._$AL.set(i,t)),o===!0&&this._$Em!==i&&(this._$Eq??=new Set).add(i))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let i=this.scheduleUpdate();return i!=null&&await i,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[o,s]of this._$Ep)this[o]=s;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[o,s]of e){let{wrapped:r}=s,l=this[o];r!==!0||this._$AL.has(o)||l===void 0||this.C(o,void 0,s,l)}}let i=!1,t=this._$AL;try{i=this.shouldUpdate(t),i?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(e){throw i=!1,this._$EM(),e}i&&this._$AE(t)}willUpdate(i){}_$AE(i){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(i)),this.updated(i)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(i){return!0}update(i){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(i){}firstUpdated(i){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[H("elementProperties")]=new Map,b[H("finalized")]=new Map,Fe?.({ReactiveElement:b}),(q.reactiveElementVersions??=[]).push("2.1.2")});function Yt(n,i){if(!gt(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ut!==void 0?Ut.createHTML(i):i}function S(n,i,t=n,e){if(i===y)return i;let o=e!==void 0?t._$Co?.[e]:t._$Cl,s=U(i)?void 0:i._$litDirective$;return o?.constructor!==s&&(o?._$AO?.(!1),s===void 0?o=void 0:(o=new s(n),o._$AT(n,t,e)),e!==void 0?(t._$Co??=[])[e]=o:t._$Cl=o),o!==void 0&&(i=S(n,o._$AS(n,i.values),o,e)),i}var mt,Ot,J,Ut,Bt,x,Vt,Re,A,O,U,gt,Pe,ct,z,It,Lt,E,Nt,Dt,Wt,_t,c,ni,ai,y,d,jt,C,He,I,dt,L,k,ht,pt,ut,ft,ze,qt,N=f(()=>{mt=globalThis,Ot=n=>n,J=mt.trustedTypes,Ut=J?J.createPolicy("lit-html",{createHTML:n=>n}):void 0,Bt="$lit$",x=`lit$${Math.random().toFixed(9).slice(2)}$`,Vt="?"+x,Re=`<${Vt}>`,A=document,O=()=>A.createComment(""),U=n=>n===null||typeof n!="object"&&typeof n!="function",gt=Array.isArray,Pe=n=>gt(n)||typeof n?.[Symbol.iterator]=="function",ct=`[ 	
\f\r]`,z=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,It=/-->/g,Lt=/>/g,E=RegExp(`>|${ct}(?:([^\\s"'>=/]+)(${ct}*=${ct}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Nt=/'/g,Dt=/"/g,Wt=/^(?:script|style|textarea|title)$/i,_t=n=>(i,...t)=>({_$litType$:n,strings:i,values:t}),c=_t(1),ni=_t(2),ai=_t(3),y=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),jt=new WeakMap,C=A.createTreeWalker(A,129);He=(n,i)=>{let t=n.length-1,e=[],o,s=i===2?"<svg>":i===3?"<math>":"",r=z;for(let l=0;l<t;l++){let a=n[l],h,u,p=-1,g=0;for(;g<a.length&&(r.lastIndex=g,u=r.exec(a),u!==null);)g=r.lastIndex,r===z?u[1]==="!--"?r=It:u[1]!==void 0?r=Lt:u[2]!==void 0?(Wt.test(u[2])&&(o=RegExp("</"+u[2],"g")),r=E):u[3]!==void 0&&(r=E):r===E?u[0]===">"?(r=o??z,p=-1):u[1]===void 0?p=-2:(p=r.lastIndex-u[2].length,h=u[1],r=u[3]===void 0?E:u[3]==='"'?Dt:Nt):r===Dt||r===Nt?r=E:r===It||r===Lt?r=z:(r=E,o=void 0);let v=r===E&&n[l+1].startsWith("/>")?" ":"";s+=r===z?a+Re:p>=0?(e.push(h),a.slice(0,p)+Bt+a.slice(p)+x+v):a+x+(p===-2?l:v)}return[Yt(n,s+(n[t]||"<?>")+(i===2?"</svg>":i===3?"</math>":"")),e]},I=class n{constructor({strings:i,_$litType$:t},e){let o;this.parts=[];let s=0,r=0,l=i.length-1,a=this.parts,[h,u]=He(i,t);if(this.el=n.createElement(h,e),C.currentNode=this.el.content,t===2||t===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(o=C.nextNode())!==null&&a.length<l;){if(o.nodeType===1){if(o.hasAttributes())for(let p of o.getAttributeNames())if(p.endsWith(Bt)){let g=u[r++],v=o.getAttribute(p).split(x),$=/([.?@])?(.*)/.exec(g);a.push({type:1,index:s,name:$[2],strings:v,ctor:$[1]==="."?ht:$[1]==="?"?pt:$[1]==="@"?ut:k}),o.removeAttribute(p)}else p.startsWith(x)&&(a.push({type:6,index:s}),o.removeAttribute(p));if(Wt.test(o.tagName)){let p=o.textContent.split(x),g=p.length-1;if(g>0){o.textContent=J?J.emptyScript:"";for(let v=0;v<g;v++)o.append(p[v],O()),C.nextNode(),a.push({type:2,index:++s});o.append(p[g],O())}}}else if(o.nodeType===8)if(o.data===Vt)a.push({type:2,index:s});else{let p=-1;for(;(p=o.data.indexOf(x,p+1))!==-1;)a.push({type:7,index:s}),p+=x.length-1}s++}}static createElement(i,t){let e=A.createElement("template");return e.innerHTML=i,e}};dt=class{constructor(i,t){this._$AV=[],this._$AN=void 0,this._$AD=i,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(i){let{el:{content:t},parts:e}=this._$AD,o=(i?.creationScope??A).importNode(t,!0);C.currentNode=o;let s=C.nextNode(),r=0,l=0,a=e[0];for(;a!==void 0;){if(r===a.index){let h;a.type===2?h=new L(s,s.nextSibling,this,i):a.type===1?h=new a.ctor(s,a.name,a.strings,this,i):a.type===6&&(h=new ft(s,this,i)),this._$AV.push(h),a=e[++l]}r!==a?.index&&(s=C.nextNode(),r++)}return C.currentNode=A,o}p(i){let t=0;for(let e of this._$AV)e!==void 0&&(e.strings!==void 0?(e._$AI(i,e,t),t+=e.strings.length-2):e._$AI(i[t])),t++}},L=class n{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(i,t,e,o){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=i,this._$AB=t,this._$AM=e,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let i=this._$AA.parentNode,t=this._$AM;return t!==void 0&&i?.nodeType===11&&(i=t.parentNode),i}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(i,t=this){i=S(this,i,t),U(i)?i===d||i==null||i===""?(this._$AH!==d&&this._$AR(),this._$AH=d):i!==this._$AH&&i!==y&&this._(i):i._$litType$!==void 0?this.$(i):i.nodeType!==void 0?this.T(i):Pe(i)?this.k(i):this._(i)}O(i){return this._$AA.parentNode.insertBefore(i,this._$AB)}T(i){this._$AH!==i&&(this._$AR(),this._$AH=this.O(i))}_(i){this._$AH!==d&&U(this._$AH)?this._$AA.nextSibling.data=i:this.T(A.createTextNode(i)),this._$AH=i}$(i){let{values:t,_$litType$:e}=i,o=typeof e=="number"?this._$AC(i):(e.el===void 0&&(e.el=I.createElement(Yt(e.h,e.h[0]),this.options)),e);if(this._$AH?._$AD===o)this._$AH.p(t);else{let s=new dt(o,this),r=s.u(this.options);s.p(t),this.T(r),this._$AH=s}}_$AC(i){let t=jt.get(i.strings);return t===void 0&&jt.set(i.strings,t=new I(i)),t}k(i){gt(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,e,o=0;for(let s of i)o===t.length?t.push(e=new n(this.O(O()),this.O(O()),this,this.options)):e=t[o],e._$AI(s),o++;o<t.length&&(this._$AR(e&&e._$AB.nextSibling,o),t.length=o)}_$AR(i=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);i!==this._$AB;){let e=Ot(i).nextSibling;Ot(i).remove(),i=e}}setConnected(i){this._$AM===void 0&&(this._$Cv=i,this._$AP?.(i))}},k=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(i,t,e,o,s){this.type=1,this._$AH=d,this._$AN=void 0,this.element=i,this.name=t,this._$AM=o,this.options=s,e.length>2||e[0]!==""||e[1]!==""?(this._$AH=Array(e.length-1).fill(new String),this.strings=e):this._$AH=d}_$AI(i,t=this,e,o){let s=this.strings,r=!1;if(s===void 0)i=S(this,i,t,0),r=!U(i)||i!==this._$AH&&i!==y,r&&(this._$AH=i);else{let l=i,a,h;for(i=s[0],a=0;a<s.length-1;a++)h=S(this,l[e+a],t,a),h===y&&(h=this._$AH[a]),r||=!U(h)||h!==this._$AH[a],h===d?i=d:i!==d&&(i+=(h??"")+s[a+1]),this._$AH[a]=h}r&&!o&&this.j(i)}j(i){i===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,i??"")}},ht=class extends k{constructor(){super(...arguments),this.type=3}j(i){this.element[this.name]=i===d?void 0:i}},pt=class extends k{constructor(){super(...arguments),this.type=4}j(i){this.element.toggleAttribute(this.name,!!i&&i!==d)}},ut=class extends k{constructor(i,t,e,o,s){super(i,t,e,o,s),this.type=5}_$AI(i,t=this){if((i=S(this,i,t,0)??d)===y)return;let e=this._$AH,o=i===d&&e!==d||i.capture!==e.capture||i.once!==e.once||i.passive!==e.passive,s=i!==d&&(e===d||o);o&&this.element.removeEventListener(this.name,this,e),s&&this.element.addEventListener(this.name,this,i),this._$AH=i}handleEvent(i){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,i):this._$AH.handleEvent(i)}},ft=class{constructor(i,t,e){this.element=i,this.type=6,this._$AN=void 0,this._$AM=t,this.options=e}get _$AU(){return this._$AM._$AU}_$AI(i){S(this,i)}},ze=mt.litHtmlPolyfillSupport;ze?.(I,L),(mt.litHtmlVersions??=[]).push("3.3.3");qt=(n,i,t)=>{let e=t?.renderBefore??i,o=e._$litPart$;if(o===void 0){let s=t?.renderBefore??null;e._$litPart$=o=new L(i.insertBefore(O(),s),s,void 0,t??{})}return o._$AI(n),o}});var vt,_,Oe,Kt=f(()=>{K();K();N();N();vt=globalThis,_=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let i=super.createRenderRoot();return this.renderOptions.renderBefore??=i.firstChild,i}update(i){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(i),this._$Do=qt(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return y}};_._$litElement$=!0,_.finalized=!0,vt.litElementHydrateSupport?.({LitElement:_});Oe=vt.litElementPolyfillSupport;Oe?.({LitElement:_});(vt.litElementVersions??=[]).push("4.2.2")});var Jt=f(()=>{});var X=f(()=>{K();N();Kt();Jt()});var Xt,Zt,Z,Gt=f(()=>{Xt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Zt=n=>(...i)=>({_$litDirective$:n,values:i}),Z=class{constructor(i){}get _$AU(){return this._$AM._$AU}_$AT(i,t,e){this._$Ct=i,this._$AM=t,this._$Ci=e}_$AS(i,t){return this.update(i,t)}update(i,t){return this.render(...t)}}});var D,Qt,te=f(()=>{N();Gt();D=class extends Z{constructor(i){if(super(i),this.it=d,i.type!==Xt.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(i){if(i===d||i==null)return this._t=void 0,this.it=i;if(i===y)return i;if(typeof i!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(i===this.it)return this._t;this.it=i;let t=[i];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}};D.directiveName="unsafeHTML",D.resultType=1;Qt=Zt(D)});var ee=f(()=>{te()});var ie,oe,G,bt,se=f(()=>{"use strict";ie=n=>n===void 0?[]:Array.isArray(n)?n:[n],oe=(n,i,t)=>{let e=n.states[i];if(e)return t?e.attributes[t]:e.state},G=(n,i,t)=>{switch(t.condition){case"state":{let e=oe(n,t.entity||i,t.attribute);if(e===void 0)return!1;let o=String(e);return t.state!==void 0?ie(t.state).some(s=>String(s)===o):t.state_not!==void 0?!ie(t.state_not).some(s=>String(s)===o):!0}case"numeric_state":{let e=Number(oe(n,t.entity||i,t.attribute));return!(Number.isNaN(e)||t.above!==void 0&&e<=t.above||t.below!==void 0&&e>=t.below)}case"and":return t.conditions.every(e=>G(n,i,e));case"or":return t.conditions.some(e=>G(n,i,e));case"not":return!t.conditions.every(e=>G(n,i,e));case"user":return!!n.user&&t.users.includes(n.user.id);case"exists":{let e=n.states[t.entity||i];return!!e&&e.state!=="unavailable"&&e.state!=="unknown"}default:return!0}},bt=(n,i,t)=>!t||t.length===0||t.every(e=>G(n,i??"",e))});var Ue,Ie,Le,re,T,yt,$t,xt,Ne,De,Q,tt,et=f(()=>{"use strict";Ue=["unavailable","unknown","none"],Ie=new Set(["sensor","number","input_number","input_text","input_select","select","text","counter","climate","weather","person","device_tracker","sun"]),Le=new Set(["off","closed","locked","not_home","idle","docked","standby","disarmed","false"]),re=n=>n.split(".")[0],T=n=>Ie.has(re(n)),yt=n=>!n||Ue.includes(n.state),$t=n=>{if(yt(n))return!1;let i=n.state;if(Le.has(i))return!1;if(T(n.entity_id)){let t=Number(i);return Number.isNaN(t)?!0:t!==0}return!0},xt=(n,i,t)=>{try{return t?n.formatEntityAttributeValue(i,t):n.formatEntityState(i)}catch{return t?String(i.attributes[t]??""):i.state}},Ne=["closed","locked","off"],De=(n,i)=>{let t=n.states[i];if(!t)return;let e=re(i),o=Ne.includes(t.state),s=e==="group"?"homeassistant":e,r;switch(e){case"lock":r=o?"unlock":"lock";break;case"cover":r=o?"open_cover":"close_cover";break;case"valve":r=o?"open_valve":"close_valve";break;case"button":case"input_button":r="press";break;case"scene":r="turn_on";break;default:r=o?"turn_on":"turn_off"}n.callService(s,r,{entity_id:i})},Q=(n,i,t)=>{n.dispatchEvent(new CustomEvent(i,{detail:t,bubbles:!0,composed:!0,cancelable:!1}))},tt=(n,i,t,e)=>{let o=t??(e?{action:"more-info",entity:e}:{action:"none"});switch(o.action){case"none":break;case"more-info":{let s=o.entity??e;s&&Q(n,"hass-more-info",{entityId:s});break}case"toggle":e&&De(i,e);break;case"navigate":history.pushState(null,"",o.navigation_path),Q(window,"location-changed",{replace:!1});break;case"url":window.open(o.url_path);break;case"perform-action":{let[s,r]=o.perform_action.split(".",2);if(!s||!r)break;i.callService(s,r,o.data??{},o.target??(e?{entity_id:e}:void 0));break}}}});var je,ne,ae,j,wt=f(()=>{"use strict";X();ee();se();et();je=(n,i)=>i?!(!bt(n,i.entity,i.visibility)||i.entity&&!n.states[i.entity]):!0,ne=(n,i)=>n[i]??(i==="on"?n.true:i==="off"?n.false:void 0),ae=(n,i)=>{let t=i?.color;if(!t)return;if(typeof t=="string")return t;let e=i?.entity?n.states[i.entity]:void 0;for(let o of t)if(!(o.when&&!bt(n,i?.entity,o.when))&&!(o.active&&!$t(e)))return o.color},j=class extends _{constructor(){super(...arguments);this.mode="view";this._held=!1;this._templateResults=new Map;this._templateSubs=new Map;this._onPointerDown=()=>{!this.config?.hold_action||this.mode!=="view"||this.config.entries?.length||(this._held=!1,this._holdTimer=window.setTimeout(()=>{this._held=!0,tt(this,this.hass,this.config.hold_action,this.config.entity)},500))};this._cancelHold=()=>{this._holdTimer&&clearTimeout(this._holdTimer),this._holdTimer=void 0};this._onClick=t=>{if(this.mode==="view"){if(t.stopPropagation(),this._cancelHold(),this._held){this._held=!1;return}this.config?.entries?.length||tt(this,this.hass,this.config?.tap_action,this.config?.entity)}};this._onEntryClick=(t,e)=>{if(this.mode==="view"){if(t.stopPropagation(),this._cancelHold(),this._held){this._held=!1;return}tt(this,this.hass,e.tap_action,e.entity)}}}connectedCallback(){super.connectedCallback(),this._manageTemplates()}disconnectedCallback(){super.disconnectedCallback();for(let t of this._templateSubs.values())t.then(e=>e()).catch(()=>{});this._templateSubs.clear(),this._templateResults.clear()}updated(){this._manageTemplates()}_desiredTemplates(){let t=[],e=this.config?.state;typeof e=="string"&&t.push(e);for(let o of this.config?.entries??[])typeof o.state=="string"&&t.push(o.state);return t}_manageTemplates(){if(!this.isConnected||!this.hass?.connection)return;let t=new Set(this._desiredTemplates());for(let[e,o]of this._templateSubs)t.has(e)||(o.then(s=>s()).catch(()=>{}),this._templateSubs.delete(e),this._templateResults.delete(e));for(let e of t){if(this._templateSubs.has(e))continue;let o=this.hass.connection.subscribeMessage(s=>{this._templateResults.set(e,s.result),this.requestUpdate()},{type:"render_template",template:e,variables:{entity:this.config?.entity},report_errors:!1}).catch(()=>(this._templateSubs.delete(e),this._templateResults.delete(e),()=>{}));this._templateSubs.set(e,o)}}get _type(){if(this.config?.entries?.length)return"composite";let t=this.config?.type;return t||(this.config?.entity&&T(this.config.entity)?"text":"icon")}get _size(){let t=this.config?.size;return t&&t>0?t:this._type==="icon"?32:14}_stateText(t){let e=this.config?.state;if(typeof e=="string")return this._templateResults.get(e)??"";if(!t)return"";if(e&&typeof e=="object"){let o=this.config.attribute?String(t.attributes[this.config.attribute]):t.state,s=ne(e,o);if(s!==void 0)return s}return xt(this.hass,t,this.config?.attribute)}_entryText(t,e){let o=t.state;if(typeof o=="string")return this._templateResults.get(o)??"";if(!e)return"";if(o&&typeof o=="object"){let s=t.attribute?String(e.attributes[t.attribute]):e.state,r=ne(o,s);if(r!==void 0)return r}return xt(this.hass,e,t.attribute)}_entryColor(t){return ae(this.hass,{entity:t.entity,color:t.color})}render(){let t=this.config??{};if(!this.hass||!je(this.hass,t))return d;let e=t.entity?this.hass.states[t.entity]:void 0,o=!!t.entity&&yt(e),s=this._type,r=this._size,l=ae(this.hass,t),a=t.on_color??"var(--state-icon-active-color, #fdd835)",h=t.off_color??"#fff",u=t.state_color!==!1&&s==="icon"&&!!t.entity&&!T(t.entity),p=l??(u?$t(e)?a:h:void 0),g=s!=="custom"&&t.name!==void 0&&t.name!==!1&&!o,v=g&&typeof t.name=="string"?t.name:g?e?.attributes.friendly_name??"":"",$=this._stateText(e),ue=s==="text"||(t.show_state??!1)&&!!$&&!o,fe=t.layout==="row"?"row":"column",st=l??"var(--primary-text-color)",St=c`<span
        class="icon-wrap"
        style=${p?`color:${p}`:""}
      >
        <ha-state-icon
          class="icon"
          .hass=${this.hass}
          .stateObj=${e}
          .icon=${t.icon}
        ></ha-state-icon>
      </span>`,me=s==="icon"?t.background===!1?St:c`<span
              class="icon-chip"
              style=${`background:${typeof t.background=="string"?t.background:"rgba(0,0,0,0.55)"}`}
              >${St}</span
            >`:d,ge=v?c`<span class="caption">${v}</span>`:d,_e=s==="text"?c`<span
            class="text-pill"
            style=${[`--fp-size:${r}px`,st?`color:${st}`:"",t.background?`background:${t.background}`:""].filter(Boolean).join(";")}
            >${$}</span
          >`:ue?c`<span class="state-text">${$}</span>`:d,ve=s==="custom"?c`<div
            class="custom"
            style=${`font-size:${r}px;color:${st};${t.background?`background:${t.background}`:""}`}
            >${Qt(t.content??"")}</div
          >`:d,be=s==="composite"?c`<div class="composite">
            ${(t.entries??[]).map(m=>{let kt=m.entity?this.hass.states[m.entity]:void 0,Tt=this._entryColor(m),$e=[`flex:${m.weight??1}`,m.min_width?`min-width:${m.min_width}px`:"",Tt?`color:${Tt}`:"",m.background?`background:${m.background}`:""].filter(Boolean).join(";");return c`<div
                class="entry"
                style=${$e}
                role="button"
                tabindex=${this.mode==="view"?0:-1}
                @click=${R=>this._onEntryClick(R,m)}
                @keydown=${R=>{this.mode==="view"&&R.key==="Enter"&&(R.stopPropagation(),this._onEntryClick(R,m))}}
              >
                ${m.icon?c`<ha-state-icon
                      class="entry-icon"
                      .hass=${this.hass}
                      .stateObj=${kt}
                      .icon=${m.icon}
                    ></ha-state-icon>`:d}
                <span class="entry-text"
                  >${this._entryText(m,kt)}</span
                >
              </div>`})}
          </div>`:d,ye=s==="custom"?ve:s==="composite"?be:c`${me}${ge}${_e}`;return c`
      <div
        class="content ${fe} ${o?"unavailable":""}"
        style=${`--fp-size:${r}px;opacity:${t.opacity??1}`}
        role="button"
        tabindex=${this.mode==="view"?0:-1}
        @click=${this._onClick}
        @pointerdown=${this._onPointerDown}
        @pointerup=${this._cancelHold}
        @pointercancel=${this._cancelHold}
        @pointerleave=${this._cancelHold}
      >
        ${ye}
      </div>
    `}};j.properties={hass:{attribute:!1},config:{attribute:!1},mode:{attribute:"mode"}},j.styles=w`
    :host {
      display: block;
      --fp-size: 32px;
    }
    /* The editor places and drags these itself; keep the element inert. */
    :host([mode="edit"]) {
      pointer-events: none;
    }
    .content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      text-align: center;
      line-height: 1.15;
    }
    .content.row {
      flex-direction: row;
      gap: 6px;
    }
    :host([mode="view"]) .content {
      cursor: pointer;
    }
    .content:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
    .icon-wrap {
      display: flex;
      color: var(--state-icon-color, #fff);
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6));
    }
    .icon-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      padding: calc(var(--fp-size) * 0.12);
      line-height: 0;
    }
    .icon-wrap ha-state-icon {
      --mdc-icon-size: var(--fp-size);
      color: inherit;
      display: block;
    }
    .caption {
      max-width: 8rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: calc(var(--fp-size) / 2.4);
      font-weight: 500;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
    }
    .state-text {
      font-size: calc(var(--fp-size) / 1.9);
      font-weight: 600;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
      white-space: nowrap;
    }
    .text-pill {
      display: inline-block;
      font-size: var(--fp-size);
      font-weight: 500;
      line-height: 1.2;
      padding: 4px 8px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.55);
      white-space: nowrap;
    }
    .custom {
      font-size: var(--fp-size);
      color: var(--primary-text-color);
    }
    .composite {
      display: flex;
      align-items: stretch;
      font-size: var(--fp-size);
      line-height: 1.2;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    }
    .entry {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      padding: 4px 8px;
      white-space: nowrap;
      min-width: 0;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }
    :host([mode="view"]) .entry {
      cursor: pointer;
    }
    .entry:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: -2px;
    }
    .entry-icon ha-state-icon {
      --mdc-icon-size: calc(var(--fp-size) * 1.15);
      color: inherit;
      display: block;
    }
    .entry-text {
      font-weight: 500;
    }
    .unavailable {
      opacity: 0.5;
    }
  `;customElements.get("floorplan-entity")||customElements.define("floorplan-entity",j)});var M,it,le,ot,Et=f(()=>{"use strict";M=n=>{if(n)return typeof n=="string"?n:n.media_content_id},it=n=>{let i=M(n);return!!i&&i.includes("{{")},le=async(n,i)=>{if(n.auth?.access_token){let t=await fetch("/api/image/upload/v1",{method:"POST",headers:{Authorization:`Bearer ${n.auth.access_token}`,"Content-Type":i.type||"image/png"},body:i});if(!t.ok)throw new Error(`Image upload failed (HTTP ${t.status})`);let e=await t.json();if(!e.url)throw new Error("Image upload returned no URL");return e.url}return URL.createObjectURL(i)},ot=(n,i)=>({width:n.width??i?.width??545,height:n.height??i?.height??725})});var de={};we(de,{FloorplanEditor:()=>F});var B,ce,Ct,Be,Ve,We,Ye,qe,Ke,Je,Xe,Ze,At,Ge,Qe,F,he=f(()=>{"use strict";X();et();et();wt();Et();B=n=>{let i={};for(let[t,e]of Object.entries(n))e===void 0||e===""||(i[t]=e);return i},ce=(n,i,t)=>{let e=[...n],[o]=e.splice(i,1);return e.splice(t,0,o),e},Ct=(n,i)=>{let t=i.length+1;for(;i.includes(`${n}-${t}`);)t++;return`${n}-${t}`},Be=[{name:"title",selector:{text:{}}},{name:"",type:"grid",schema:[{name:"height",selector:{number:{min:0,mode:"box"}}},{name:"remember_floor",selector:{boolean:{}}}]},{name:"",type:"grid",schema:[{name:"coords",label:"Coordinates",selector:{select:{options:["pixels","percent"],custom_value:!1}}},{name:"show_floor_selector",selector:{boolean:{}}}]}],Ve=[{name:"name",label:"Floor name",selector:{text:{}}},{name:"",type:"grid",schema:[{name:"width",selector:{number:{min:0,mode:"box"}}},{name:"height",selector:{number:{min:0,mode:"box"}}}]},{name:"preserve_aspect_ratio",selector:{select:{mode:"dropdown",options:[{value:"xMidYMax slice",label:"Zoom, bottom-anchored (classic floorplan)"},{value:"xMidYMid slice",label:"Zoom, centered"},{value:"xMinYMin slice",label:"Zoom, top-left anchored"},{value:"none",label:"Stretch to fill"},{value:"xMidYMid meet",label:"Fit (letterbox)"}]}}}],We=[{name:"entity",selector:{entity:{}}},{name:"",type:"grid",schema:[{name:"icon",selector:{icon:{}}},{name:"size",selector:{number:{min:8,max:160,mode:"box"}}}]},{name:"",type:"grid",schema:[{name:"x",selector:{number:{min:0,max:1e4,mode:"box"}}},{name:"y",selector:{number:{min:0,max:1e4,mode:"box"}}}]},{name:"",type:"grid",schema:[{name:"name",selector:{text:{}}},{name:"attribute",selector:{text:{}}}]},{name:"",type:"grid",schema:[{name:"show_state",selector:{boolean:{}}},{name:"state_color",selector:{boolean:{}}}]},{name:"",type:"grid",schema:[{name:"opacity",selector:{number:{min:0,max:1,mode:"box",step:.05}}},{name:"background",selector:{text:{}}},{name:"on_color",selector:{text:{}}},{name:"off_color",selector:{text:{}}}]}],Ye=[{name:"tap_action",selector:{ui_action:{default_action:"more-info"}}},{name:"hold_action",selector:{ui_action:{default_action:"none"}}}],qe={title:"Title",height:"Height (px)",remember_floor:"Remember last floor",coords:"Coordinate space",show_floor_selector:"Show floor selector",width:"Width (px)",preserve_aspect_ratio:"Image fit",entity:"Entity",icon:"Icon",size:"Icon / text size (px)",x:"X position",y:"Y position",name:"Name override",attribute:"Attribute instead of state",show_state:"Show state",state_color:"Tint icon by state",opacity:"Opacity",background:"Pill background",on_color:"On color (active)",off_color:"Off color (inactive)",tap_action:"Tap action",hold_action:"Hold action (press and hold)"},Ke=["icon","text","composite","custom"],Je=["column","row"],Xe=["none","map","template"],Ze=n=>n.state===void 0?"none":typeof n.state=="string"?"template":"map",At=n=>{if(!Array.isArray(n)||n.length!==1)return;let[i]=n;return Object.keys(i).every(e=>e==="color"||e==="active")?i:void 0},Ge=n=>n.color===void 0?"none":typeof n.color=="string"||At(n.color)?"fixed":"rules",Qe=n=>typeof n.color=="string"?n.color:At(n.color)?.color??"",F=class extends _{constructor(){super(...arguments);this._selected=-1;this._measured=new Map;this._broken=new Set;this._uploading=!1;this._layoutOpen=!1;this._modes={};this._drag=null;this._imageResult=new Map;this._imageUnsubs=new Map;this._subscribedImages=new Set;this._label=t=>t.label??qe[t.name]??t.name.replace(/_/g," ");this._onPickFile=t=>{let e=t.target.files?.[0];e&&this._upload(e)};this._measure=t=>e=>{let o=e.currentTarget;o.naturalWidth&&(this._measured=new Map(this._measured).set(t,{width:o.naturalWidth,height:o.naturalHeight}))};this._onError=t=>()=>{this._broken.has(t)||(this._broken=new Set(this._broken).add(t))};this._onStageDown=t=>{if(t.button!==0)return;let e=t.target.closest(".fp-wrap[data-idx]");if(e){let o=Number(e.getAttribute("data-idx"));this._selected=o,this._drag={idx:o,pointerId:t.pointerId},t.currentTarget.setPointerCapture(t.pointerId),this._config={...this._config},t.preventDefault();return}this._selected=-1,this._config={...this._config}};this._onStageMove=t=>{let e=this._drag;if(!e)return;let o=this._toImageCoords(t);if(!o)return;let r=(this._floor().entities??[])[e.idx];r&&(r.x=o.x,r.y=o.y,this._config={...this._config})};this._onStageUp=()=>{this._drag&&this._emit(this._config),this._drag=null};this._clickFile=()=>{this._fileInput?.click()}}connectedCallback(){super.connectedCallback(),this._manageImageTemplate()}disconnectedCallback(){super.disconnectedCallback();for(let t of this._imageUnsubs.values())t.then(e=>e()).catch(()=>{});this._imageUnsubs.clear(),this._subscribedImages.clear()}updated(){this._manageImageTemplate()}_manageImageTemplate(){let e=this._floor()?.image,o=typeof e=="string"&&e.includes("{{")?e:void 0;!o||this._subscribedImages.has(o)||!this.isConnected||!this.hass?.connection||(this._subscribedImages.add(o),this._imageUnsubs.set(o,this.hass.connection.subscribeMessage(s=>{let r=String(s.result??"").trim();r?this._imageResult.set(o,r):this._imageResult.delete(o),this.requestUpdate()},{type:"render_template",template:o,report_errors:!1}).catch(()=>(this._subscribedImages.delete(o),this._imageUnsubs.delete(o),()=>{}))))}_srcOf(t){let e=M(t.image);return e&&it(e)?this._imageResult.get(e):e}setConfig(t){let e=(t.floors??[]).map(r=>this._normalize(r)),o=JSON.stringify(e),s=o===this._lastSig;this._lastSig=o,this._config={...t,floors:e},e.some(r=>r.id===this._activeFloor)||(this._activeFloor=(t.default_floor&&e.some(r=>r.id===t.default_floor)?t.default_floor:void 0)??e[0]?.id),s||(this._selected=-1)}_normalize(t){let e=this._floors?.map(s=>s.id).filter(Boolean)??[],o=t.id??Ct("floor",e);return{...t,id:o,name:t.name,entities:t.entities??[]}}get _floors(){return this._config?.floors??[]}_floor(){return this._floors.find(t=>t.id===this._activeFloor)??this._floors[0]}_size(){let t=this._floor(),e=M(t.image);return ot(t,e?this._measured.get(e):void 0)}_emit(t){t.floors.some(e=>e.id===this._activeFloor)||(this._activeFloor=t.floors[0]?.id),this._selected=Math.min(this._selected,(this._floor()?.entities??[]).length-1),this._config=t,this._lastSig=JSON.stringify(t.floors??[]),Q(this,"config-changed",{config:t})}_updateFloor(t){this._emit({...this._config,floors:this._floors.map(e=>e.id===this._activeFloor?{...e,...B(t)}:e)})}_updateEntity(t,e){let s=(this._floor().entities??[]).map((r,l)=>l===t?{...r,...B(e)}:r);this._emit({...this._config,floors:this._floors.map(r=>r.id===this._activeFloor?{...r,entities:s}:r)})}_setModifier(t,e,o){let r=(this._floor().entities??[]).map((l,a)=>a===t?{...l,[e]:o}:l);this._emit({...this._config,floors:this._floors.map(l=>l.id===this._activeFloor?{...l,entities:r}:l)})}_addFloor(){let t=[...this._floors,{id:Ct("floor",this._floors.map(o=>o.id)),name:"New floor",width:545,height:725,entities:[]}],e=t[t.length-1].id;this._activeFloor=e,this._selected=-1,this._modes={},this._emit({...this._config,floors:t})}_switchFloor(t){this._activeFloor=t,this._selected=-1,this._modes={},this._config={...this._config}}_removeFloor(t,e){e?.stopPropagation();let o=this._floors;if(o.length<=1)return;let s=o.filter((r,l)=>l!==t);this._activeFloor=void 0,this._selected=-1,this._modes={},this._emit({...this._config,floors:s})}_duplicateFloor(t,e){e?.stopPropagation();let o=this._floors,s=o[t],r={...s,id:Ct("floor",o.map(a=>a.id)),entities:(s.entities??[]).map(a=>({...a}))},l=[...o];l.splice(t+1,0,r),this._activeFloor=r.id,this._selected=-1,this._modes={},this._emit({...this._config,floors:l})}_addEntity(t,e){let s=[...this._floor().entities??[]],r={entity:"",type:"icon",x:Math.round(t),y:Math.round(e),size:32};s.push(r),this._selected=s.length-1,this._emit({...this._config,floors:this._floors.map(l=>l.id===this._activeFloor?{...l,entities:s}:l)})}_removeEntity(t,e){e?.stopPropagation();let s=(this._floor().entities??[]).filter((r,l)=>l!==t);this._selected===t?this._selected=-1:this._selected>t&&this._selected--,this._modes={},this._emit({...this._config,floors:this._floors.map(r=>r.id===this._activeFloor?{...r,entities:s}:r)})}_duplicateEntity(t,e){e?.stopPropagation();let s=[...this._floor().entities??[]],r={...s[t]};s.splice(t+1,0,r),this._selected=t+1,this._modes={},this._emit({...this._config,floors:this._floors.map(l=>l.id===this._activeFloor?{...l,entities:s}:l)})}async _upload(t){this._uploading=!0;try{let e=await le(this.hass,t);this._broken=new Set(this._broken),this._broken.delete(e),this._updateFloor({image:e})}catch(e){alert(`Could not upload image:
${String(e)}`)}finally{this._uploading=!1}}_toImageCoords(t){let e=this.shadowRoot?.querySelector(".stage");if(!e)return;let o=e.getBoundingClientRect();if(!o.width||!o.height)return;let{width:s,height:r}=this._size(),l=(t.clientX-o.left)/o.width*s,a=(t.clientY-o.top)/o.height*r;return this._config.coords==="percent"?{x:l/s*100,y:a/r*100}:{x:Math.max(0,Math.min(s,Math.round(l))),y:Math.max(0,Math.min(r,Math.round(a)))}}render(){if(!this.hass||!this._config)return d;let t=this._floor();return t?c`
      <div class="editor">
        ${this._renderTabs()}
        ${this._renderCardPanel()}
        ${this._renderFloorPanel(t)}
        ${this._renderEntityPanel(t)}
      </div>
      ${this._layoutOpen?this._renderLayoutModal(t):d}
    `:d}_renderTabs(){let t=this._floors;return c`
      <div class="tabs">
        ${t.map((e,o)=>c`
            <button
              class="tab ${e.id===this._activeFloor?"active":""}"
              @click=${()=>this._switchFloor(e.id)}
            >
              <span class="tab-name">${e.name??e.id}</span>
              <ha-icon
                class="tab-x ${t.length<=1?"disabled":""}"
                icon="mdi:close"
                @click=${s=>this._removeFloor(o,s)}
              ></ha-icon>
            </button>
          `)}
        <button class="tab add" @click=${this._addFloor}>+ Floor</button>
      </div>
    `}_renderLayoutModal(t){let{width:e,height:o}=this._size(),s=e&&o?`${e} / ${o}`:"4 / 3";return c`
      <div class="modal-backdrop" @click=${()=>{this._layoutOpen=!1}}>
        <div class="modal" @click=${r=>r.stopPropagation()}>
          <div class="modal-header">
            <div class="modal-tabs">
              ${this._floors.map(r=>c`
                  <button
                    class="tab ${r.id===this._activeFloor?"active":""}"
                    @click=${()=>this._switchFloor(r.id)}
                  >
                    ${r.name??r.id}
                  </button>
                `)}
            </div>
            <div class="modal-actions">
              <button
                @click=${()=>{let{width:r,height:l}=this._size();this._addEntity(r/2,l/2)}}
              >
                + Entity
              </button>
              <button class="close" title="Close" @click=${()=>{this._layoutOpen=!1}}>
                <ha-icon icon="mdi:close"></ha-icon>
              </button>
            </div>
          </div>
          <div
            class="stage"
            style=${`aspect-ratio:${s};width:100%`}
            @pointerdown=${this._onStageDown}
            @pointermove=${this._onStageMove}
            @pointerup=${this._onStageUp}
            @pointercancel=${this._onStageUp}
          >
            ${this._renderStage(t,e,o)}
          </div>
          <div class="hint">Drag an entity to reposition it — the change saves when you drop it.</div>
        </div>
      </div>
    `}_renderStage(t,e,o){let s=this._srcOf(t),r=t.entities??[],l=s?c`<svg
          class="bg"
          viewBox="0 0 ${e} ${o}"
          preserveAspectRatio="none"
        >
          <image
            href=${s}
            width=${e}
            height=${o}
            preserveAspectRatio=${t.preserve_aspect_ratio??"xMidYMax slice"}
            @load=${this._measure(s)}
            @error=${this._onError(s)}
          ></image>
        </svg>`:c`<div class="placeholder">
          <ha-icon icon="mdi:image-plus-outline"></ha-icon>
          <span>${t.name??"Floor"} — no image</span>
        </div>`,a=r.map((h,u)=>this._renderHandle(h,u,e,o));return c`
      ${l}
      <div class="layer">
        ${a}
        ${s?c`<div class="size-chip">${e} ${"\xD7"} ${o}</div>`:d}
      </div>
    `}_renderHandle(t,e,o,s){let r=this._percent(t.x,o),l=this._percent(t.y,s),a=e===this._selected;return c`
      <div
        class="fp-wrap ${a?"selected":""}"
        data-idx=${e}
        style=${`left:${r}%;top:${l}%`}
      >
        <floorplan-entity
          .hass=${this.hass}
          .config=${t}
          mode="edit"
          ?data-composite=${!!t.entries?.length}
        ></floorplan-entity>
        ${a?c`
              <button
                class="del"
                title="Remove"
                @pointerdown=${h=>h.stopPropagation()}
                @click=${h=>this._removeEntity(e,h)}
              >
                <ha-icon icon="mdi:close"></ha-icon>
              </button>
              <div class="coords">
                ${this._config.coords==="percent"?`${t.x?.toFixed(1)}%, ${t.y?.toFixed(1)}%`:`${t.x??0}, ${t.y??0}`}
              </div>
            `:d}
      </div>
    `}_percent(t,e){return this._config.coords==="percent"?t??0:(t??0)/(e||1)*100}_renderCardPanel(){return c`
      <h3>Card</h3>
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${Be}
        .computeLabel=${this._label}
        @value-changed=${t=>{t.stopPropagation(),this._emit({...this._config,...B(t.detail.value)})}}
      ></ha-form>
    `}_renderFloorPanel(t){let e=this._srcOf(t),o=this._floors.indexOf(t);return c`
      <h3>Floor · ${t.name??t.id}</h3>
      <div class="image-row">
        ${e?c`<img class="thumb" src=${e} @error=${this._onError(e)} />`:c`<div class="thumb empty">
              <ha-icon icon="mdi:image-off-outline"></ha-icon>
            </div>`}
        <div class="image-actions">
          <input
            type="file"
            class="file"
            accept="image/*"
            @change=${this._onPickFile}
          />
          <button @click=${this._clickFile}>${this._uploading?"Uploading\u2026":"Upload image"}</button>
          ${e?c`<button class="danger" @click=${()=>this._updateFloor({image:void 0})}>Remove image</button>`:d}
        </div>
      </div>
      <input
        class="text"
        .value=${typeof e=="string"?e:e??""}
        placeholder="…or image URL (/local/floorplan/eg.png)"
        @change=${s=>this._updateFloor({image:s.target.value||void 0})}
      />
      <ha-form
        .hass=${this.hass}
        .data=${{name:t.name,width:t.width,height:t.height,preserve_aspect_ratio:t.preserve_aspect_ratio}}
        .schema=${Ve}
        .computeLabel=${this._label}
        @value-changed=${s=>{s.stopPropagation(),this._updateFloor(B(s.detail.value))}}
      ></ha-form>
      ${this._rowButtons(o,this._floors.length,s=>this._emit({...this._config,floors:ce(this._floors,o,s)}),s=>this._duplicateFloor(o,s),()=>this._removeFloor(o))}
    `}_renderEntityRows(t){let e=t.entities??[];return c`
      ${e.map((o,s)=>{let r=s===this._selected;return c`
          <div class="block ${r?"open":""}">
            <div
              class="block-header"
              @click=${()=>{this._selected=r?-1:s,this._config={...this._config}}}
            >
              <span class="block-title"
                >${o.entity||(o.type==="custom"?"Custom":o.type==="composite"||o.entries?.length?"Composite":o.type==="text"?"Text":"Icon")}</span
              >
              <span class="count"
                >${o.x??0}, ${o.y??0}</span
              >
              ${this._rowButtons(s,e.length,l=>{this._modes={},this._emit({...this._config,floors:this._floors.map(a=>a.id===this._activeFloor?{...a,entities:ce(e,s,l)}:a)})},l=>this._duplicateEntity(s,l),l=>this._removeEntity(s,l))}
            </div>
            ${r?this._renderEntityForm(o,s):d}
          </div>
        `})}
    `}_renderEntityPanel(t){return c`
      <div class="panel-head">
        <h3>Entities · ${(t.entities??[]).length}</h3>
        <button class="mode" @click=${()=>{this._layoutOpen=!0}}>
          <ha-icon icon="mdi:arrow-expand-all"></ha-icon> Edit layout
        </button>
      </div>
      ${this._renderEntityRows(t)}
      <button class="add" @click=${()=>{let{width:e,height:o}=this._size();this._addEntity(e/2,o/2)}}>
        + Entity
      </button>
    `}_renderEntityForm(t,e){let o=t.type??(t.entries?.length?"composite":t.entity&&T(t.entity)?"text":"icon"),s=this._modes[e]?.state??Ze(t);return c`
      <div class="block-body">
        <ha-form
          .hass=${this.hass}
          .data=${{entity:t.entity,icon:t.icon,size:t.size,x:t.x,y:t.y,name:t.name,attribute:t.attribute,show_state:t.show_state,state_color:t.state_color,opacity:t.opacity,background:typeof t.background=="string"?t.background:void 0,on_color:t.on_color,off_color:t.off_color}}
          .schema=${We}
          .computeLabel=${this._label}
          @value-changed=${r=>{r.stopPropagation(),this._updateEntity(e,B(r.detail.value))}}
        ></ha-form>

        ${this._segments("Type",Ke,o,r=>{this._setModifier(e,"type",r),r!=="composite"&&this._setModifier(e,"entries",void 0)})}
        ${o==="composite"?c`<div class="field">
              <label>Cells (composite) — left/right pill half</label>
              <ha-yaml-editor
                .label=${`- entity: sensor.temprature_kitchen
  background: "#8c1f1f"
- entity: sensor.humidity_kitchen
  background: "#35619f"`}
                .defaultValue=${t.entries}
                @value-changed=${r=>{r.stopPropagation(),r.detail.isValid&&this._setModifier(e,"entries",r.detail.value)}}
              ></ha-yaml-editor>
            </div>`:d}
        ${this._segments("Layout",Je,t.layout??"column",r=>this._setModifier(e,"layout",r==="column"?void 0:r))}

        <div class="field">
          <label>State override — replaces the displayed state text</label>
          ${this._segments("",Xe,s,r=>{let l=r==="none"?void 0:r==="map"?typeof t.state=="object"?t.state:{on:"On",off:"Off"}:typeof t.state=="string"?t.state:"{{ states(entity) }}";this._modes={...this._modes,[e]:{...this._modes[e],state:r}},this._setModifier(e,"state",l)})}
          ${s==="map"?c`<ha-yaml-editor
                .label=${'Raw state \u2192 text. Quote "on" and "off", or YAML turns them into booleans.'}
                .defaultValue=${t.state}
                @value-changed=${r=>{r.stopPropagation(),r.detail.isValid&&this._setModifier(e,"state",r.detail.value)}}
              ></ha-yaml-editor>`:s==="template"?c`<input
                  class="text"
                  .value=${t.state??""}
                  placeholder="{{ 'On' if is_state(entity, 'on') else 'Off' }}"
                  @change=${r=>this._setModifier(e,"state",r.target.value||void 0)}
                />`:d}
        </div>

        ${this._renderColor(t,e)}

        <div class="field">
          <label>Visibility conditions</label>
          <ha-yaml-editor
            .label=${"Empty = always visible"}
            .defaultValue=${t.visibility}
            @value-changed=${r=>{r.stopPropagation(),r.detail.isValid&&this._setModifier(e,"visibility",r.detail.value)}}
          ></ha-yaml-editor>
        </div>

        <ha-form
          .hass=${this.hass}
          .data=${{tap_action:t.tap_action,hold_action:t.hold_action}}
          .schema=${Ye}
          .computeLabel=${this._label}
          @value-changed=${r=>{r.stopPropagation(),this._setModifier(e,"tap_action",r.detail.value.tap_action),this._setModifier(e,"hold_action",r.detail.value.hold_action)}}
        ></ha-form>
      </div>
    `}_renderColor(t,e){let o=this._modes[e]?.color??Ge(t),s=Qe(t),r=!!At(t.color)?.active,l=(a,h)=>this._setModifier(e,"color",h?[{color:a,active:!0}]:a);return c`
      <div class="field">
        <label>Color</label>
        ${this._segments("",["none","fixed","rules"],o,a=>{let h=a==="none"?void 0:a==="fixed"?s||"red":Array.isArray(t.color)?t.color:[{color:s||"red"}];this._modes={...this._modes,[e]:{...this._modes[e],color:a}},this._setModifier(e,"color",h)})}
        ${o==="fixed"?c`
              <input
                class="text"
                .value=${s}
                placeholder="red, amber, #ff0000 …"
                @change=${a=>l(a.target.value,r)}
              />
              <label class="check">
                <input
                  type="checkbox"
                  .checked=${r}
                  @change=${a=>l(s,a.target.checked)}
                />
                Only while the entity is active — otherwise the colour applies in every state
              </label>
            `:d}
        ${o==="rules"?c`<ha-yaml-editor
              .label=${"Color rules \u2014 first match wins"}
              .defaultValue=${t.color}
              @value-changed=${a=>{a.stopPropagation(),a.detail.isValid&&this._setModifier(e,"color",a.detail.value)}}
            ></ha-yaml-editor>`:d}
      </div>
    `}_segments(t,e,o,s){return c`
      <div class="seg-row">
        ${t?c`<span class="seg-label">${t}</span>`:d}
        <div class="modes">
          ${e.map(r=>c`
              <button
                class="mode ${r===o?"selected":""}"
                @click=${()=>r!==o&&s(r)}
              >
                ${r}
              </button>
            `)}
        </div>
      </div>
    `}_rowButtons(t,e,o,s,r){let l=(a,h)=>{a.stopPropagation(),h()};return c`
      <span class="row-buttons">
        <button
          ?disabled=${t===0}
          @click=${a=>l(a,()=>o(t-1))}
          title="Move up"
        >
          <ha-icon icon="mdi:arrow-up"></ha-icon>
        </button>
        <button
          ?disabled=${t===e-1}
          @click=${a=>l(a,()=>o(t+1))}
          title="Move down"
        >
          <ha-icon icon="mdi:arrow-down"></ha-icon>
        </button>
        <button
          @click=${a=>l(a,()=>s(a))}
          title="Duplicate"
        >
          <ha-icon icon="mdi:content-copy"></ha-icon>
        </button>
        <button
          class="danger"
          @click=${a=>l(a,()=>r(a))}
          title="Delete"
        >
          <ha-icon icon="mdi:delete"></ha-icon>
        </button>
      </span>
    `}};F.properties={hass:{attribute:!1},_config:{state:!0},_activeFloor:{state:!0},_selected:{state:!0},_measured:{state:!0},_broken:{state:!0},_uploading:{state:!0},_layoutOpen:{state:!0},_modes:{state:!0}},F.styles=w`
    .editor {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    h3 {
      margin: 10px 0 2px;
      font-size: 0.86rem;
      font-weight: 500;
      color: var(--primary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    h3:first-child {
      margin-top: 0;
    }
    /* ---- tabs ---- */
    .tabs {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;
    }
    .tab {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font: inherit;
      font-size: 0.82rem;
      padding: 5px 10px;
      border: 1px solid var(--divider-color);
      border-radius: 999px;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
    }
    .tab.active {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
    .tab.add {
      border-style: dashed;
    }
    .tab-x {
      --mdc-icon-size: 14px;
      color: var(--secondary-text-color);
    }
    .tab-x.disabled {
      opacity: 0.3;
    }
    .panel-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .panel-head h3 {
      margin: 0;
    }
    .panel-head .mode ha-icon {
      --mdc-icon-size: 14px;
      vertical-align: -2px;
      margin-right: 2px;
    }
    .mode {
      font: inherit;
      font-size: 0.78rem;
      padding: 4px 9px;
      border: 1px solid var(--divider-color);
      border-radius: 999px;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
    }
    .mode.selected {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
    /* ---- layout modal ---- */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      z-index: 1000;
    }
    .modal {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: min(92vw, 1100px);
      max-height: 90vh;
      overflow: auto;
      padding: 14px;
      border-radius: 12px;
      background: var(--card-background-color);
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
    }
    .modal-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .modal-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .modal-actions .close {
      width: 28px;
      height: 28px;
      padding: 2px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-color: transparent;
    }
    .modal-actions .close ha-icon {
      --mdc-icon-size: 18px;
    }
    .stage {
      position: relative;
      border: 1px solid var(--divider-color);
      border-radius: 10px;
      overflow: hidden;
      touch-action: none;
      background: var(--card-background-color);
    }
    .bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    .layer {
      position: absolute;
      inset: 0;
    }
    .fp-wrap {
      position: absolute;
      display: inline-block;
      transform: translate(-50%, -50%);
      line-height: 0;
    }
    .fp-wrap.selected {
      outline: 2px dashed var(--primary-color);
      outline-offset: 4px;
      border-radius: 6px;
    }
    .fp-wrap .del {
      position: absolute;
      top: -14px;
      right: -14px;
      width: 22px;
      height: 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 999px;
      background: var(--error-color, #e5534b);
      color: #fff;
      cursor: pointer;
      padding: 0;
    }
    .fp-wrap .del ha-icon {
      --mdc-icon-size: 14px;
    }
    .fp-wrap .coords {
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 11px;
      color: var(--primary-color);
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      padding: 0 5px;
      border-radius: 4px;
      white-space: nowrap;
    }
    .size-chip {
      position: absolute;
      bottom: 6px;
      right: 6px;
      font-size: 11px;
      color: var(--secondary-text-color);
      background: color-mix(in srgb, var(--card-background-color) 80%, transparent);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .placeholder {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: var(--secondary-text-color);
      font-size: 0.85rem;
    }
    .hint {
      font-size: 0.74rem;
      color: var(--secondary-text-color);
    }
    /* ---- floor image row ---- */
    .image-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .thumb {
      width: 64px;
      height: 64px;
      object-fit: cover;
      border-radius: 6px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
    }
    .thumb.empty {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .image-actions {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-start;
    }
    .file {
      display: none;
    }
    button {
      font: inherit;
      font-size: 0.8rem;
      padding: 5px 10px;
      border: 1px solid var(--divider-color);
      border-radius: 999px;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.35;
      cursor: default;
    }
    button.danger:hover {
      border-color: var(--error-color, #e5534b);
      color: var(--error-color, #e5534b);
    }
    .add {
      align-self: flex-start;
    }
    .text {
      font: inherit;
      font-size: 0.85rem;
      padding: 6px 8px;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
    }
    /* ---- entity blocks ---- */
    .block {
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      overflow: hidden;
    }
    .block-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 8px;
      cursor: pointer;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
    }
    .block-title {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.86rem;
      color: var(--primary-text-color);
    }
    .block.open {
      border-color: var(--primary-color);
    }
    .count {
      flex: none;
      font-size: 0.7rem;
      color: var(--secondary-text-color);
    }
    .block-body {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 10px;
      background: var(--card-background-color);
    }
    .row-buttons {
      display: flex;
      gap: 2px;
    }
    .row-buttons button {
      padding: 2px;
      width: 24px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-color: transparent;
      color: var(--secondary-text-color);
    }
    .row-buttons button:hover:not(:disabled) {
      border-color: var(--divider-color);
      color: var(--primary-text-color);
    }
    .row-buttons ha-icon {
      --mdc-icon-size: 16px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .field > label,
    .seg-label {
      font-size: 0.74rem;
      color: var(--secondary-text-color);
    }
    .seg-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .modes {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .check {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      font-size: 0.74rem;
      color: var(--secondary-text-color);
    }
    .check input {
      flex: none;
      margin: 0;
    }
  `;customElements.get("floorplan-card-editor")||customElements.define("floorplan-card-editor",F)});X();wt();Et();var pe="floorplan-card.floor.",V=class extends _{constructor(){super(...arguments);this._measured=new Map;this._broken=new Set;this._imageResult=new Map;this._imageUnsubs=new Map;this._subscribedImages=new Set;this._measure=t=>e=>{let o=e.currentTarget;if(!o.naturalWidth)return;let s=new Map(this._measured).set(t,{width:o.naturalWidth,height:o.naturalHeight});this._measured=s};this._onError=t=>()=>{this._broken.has(t)||(this._broken=new Set(this._broken).add(t))}}connectedCallback(){super.connectedCallback(),this._manageImageTemplate()}disconnectedCallback(){super.disconnectedCallback();for(let t of this._imageUnsubs.values())t.then(e=>e()).catch(()=>{});this._imageUnsubs.clear(),this._subscribedImages.clear()}updated(){this._manageImageTemplate()}_manageImageTemplate(){let e=this._floor()?.image,o=typeof e=="string"&&e.includes("{{")?e:void 0;!o||this._subscribedImages.has(o)||!this.isConnected||!this.hass?.connection||(this._subscribedImages.add(o),this._imageUnsubs.set(o,this.hass.connection.subscribeMessage(s=>{let r=String(s.result??"").trim();r?this._imageResult.set(o,r):this._imageResult.delete(o),this.requestUpdate()},{type:"render_template",template:o,report_errors:!1}).catch(()=>(this._subscribedImages.delete(o),this._imageUnsubs.delete(o),()=>{}))))}_srcOf(t){let e=M(t.image);return e&&it(e)?this._imageResult.get(e):e}static async getConfigElement(){return await Promise.resolve().then(()=>(he(),de)),document.createElement("floorplan-card-editor")}static getStubConfig(){return{type:"custom:floorplan-card-next",floors:[{id:"eg",name:"Ground floor",width:545,height:725,entities:[]}]}}setConfig(t){if(!t)throw new Error("Invalid configuration");let e=t.floors??[];if(!Array.isArray(e))throw new Error("`floors` must be a list");for(let o of e)if(!Array.isArray(o.entities??[]))throw new Error(`Floor "${o.name??o.id}" needs an \`entities\` list`);this._config=t,(!this._activeFloor||!e.some(o=>o.id===this._activeFloor))&&(this._activeFloor=this._storedFloor())}get _floors(){return this._config?.floors??[]}get _forceNewFloor(){let t=this._activeFloor;return!t||!this._floors.some(e=>e.id===t)}_floor(){return this._forceNewFloor?this._floors[0]:this._floors.find(t=>t.id===this._activeFloor)??this._floors[0]}_storedFloor(){if(this._config?.remember_floor===!1)return;let t=localStorage.getItem(pe+"last");return t&&this._floors.some(e=>e.id===t)?t:this._config?.default_floor??this._floors[0]?.id}_switchFloor(t){if(this._activeFloor=t,this._config.remember_floor!==!1)try{localStorage.setItem(pe+"last",t)}catch{}}_percent(t,e){return this._config.coords==="percent"?t??0:(t??0)/(e||1)*100}render(){if(!this.hass||!this._config)return d;let t=this._floor();if(!t)return d;let e=this._srcOf(t),o=e?this._measured.get(e):void 0,s=ot(t,o),{width:r,height:l}=s,u=[`aspect-ratio:${r&&l?`${r} / ${l}`:"4 / 3"}`,this._config.height?`height:${this._config.height}px;width:auto;margin:0 auto;`:"width:100%"].join(";");return c`
      <ha-card>
        ${this._renderHeader(this._floors,t)}
        <div
          class="stage"
          style=${u}
        >
          ${this._renderBackground(t,e,r,l)}
          <div class="layer">
            ${(t.entities??[]).map(p=>this._renderEntity(p,r,l))}
          </div>
        </div>
      </ha-card>
    `}_renderHeader(t,e){let o=t.length>1&&this._config.show_floor_selector!==!1;return!this._config.title&&!o?d:c`
      <div class="header">
        ${this._config.title?c`<div class="title">${this._config.title}</div>`:d}
        ${o?c`<div class="pills">
              ${t.map(s=>c`
                  <button
                    class="pill ${s.id===e.id?"active":""}"
                    @click=${()=>this._switchFloor(s.id)}
                  >
                    ${s.name??s.id}
                  </button>
                `)}
            </div>`:d}
      </div>
    `}_renderBackground(t,e,o,s){if(e&&this._broken.has(e))return d;if(!e)return c`<div class="placeholder">
        <ha-icon icon="mdi:image-off-outline"></ha-icon>
        <span>${t.name??t.id??"Floor"}</span>
      </div>`;let r=t.preserve_aspect_ratio??"xMidYMax slice";return c`
      <svg
        class="bg"
        viewBox="0 0 ${o} ${s}"
        preserveAspectRatio="none"
      >
        <image
          href=${e}
          width=${o}
          height=${s}
          preserveAspectRatio=${r}
          @load=${this._measure(e)}
          @error=${this._onError(e)}
        ></image>
      </svg>
    `}_renderEntity(t,e,o){let s=this._percent(t.x,e),r=this._percent(t.y,o);return c`
      <div
        class="entity"
        style=${`left:${s}%;top:${r}%`}
      >
        <floorplan-entity
          class="view"
          .hass=${this.hass}
          .config=${t}
          mode="view"
          ?data-composite=${!!t.entries?.length}
        ></floorplan-entity>
      </div>
    `}getCardSize(){return 1+(this._config?.floors?.length?1:0)}getGridOptions(){return{rows:"auto",columns:"full",min_columns:4}}};V.properties={hass:{attribute:!1},_config:{state:!0},_activeFloor:{state:!0},_measured:{state:!0},_broken:{state:!0}},V.styles=w`
    ha-card {
      overflow: hidden;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 12px 4px;
    }
    .title {
      font-size: 1rem;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .pills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-left: auto;
    }
    .pill {
      font: inherit;
      font-size: 0.82rem;
      font-weight: 500;
      padding: 5px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 999px;
      background: var(--card-background-color);
      color: var(--secondary-text-color);
      cursor: pointer;
    }
    .pill.active {
      border-color: var(--primary-color);
      color: var(--primary-color);
      background: color-mix(
        in srgb,
        var(--primary-color) 14%,
        transparent
      );
    }
    .stage {
      position: relative;
      margin: 0 auto;
    }
    .bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border-radius: 4px;
      overflow: hidden;
    }
    .bg image {
      width: 100%;
      height: 100%;
    }
    .layer {
      position: absolute;
      inset: 0;
      overflow: visible;
    }
    .entity {
      position: absolute;
      display: inline-block;
      transform: translate(-50%, -50%);
    }
    .placeholder {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 1px dashed var(--divider-color);
      border-radius: 8px;
      color: var(--secondary-text-color);
      font-size: 0.85rem;
    }
  `;customElements.get("floorplan-card-next")||customElements.define("floorplan-card-next",V);var ti="0.1.0";window.customCards=window.customCards??[];window.customCards.push({type:"floorplan-card-next",name:"Floorplan Card (Next)",description:"Multi-floor floorplan card with a drag-and-drop visual editor: upload a background image, place entities on it, wire actions \u2014 natives entity tracking, image caching and easy image swap-out built in.",preview:!1,documentationURL:"https://github.com/glassp/haos-floorplan-card"});console.info(`%c FLOORPLAN-CARD %c ${ti} `,"color:#fff;background:#4caf50","color:#4caf50;background:#fff");
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directive.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/unsafe-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/

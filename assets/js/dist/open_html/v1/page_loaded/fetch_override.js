var n=window.fetch,r=window.top.currFiles;window.fetch=(e,s)=>{if(typeof e==="string"&&!e.startsWith("http")){let t=r[e];if(t)return n(t,s);else return new Promise((o)=>{o(new Response(`Not found
Open HTML / v1`,{status:404}))})}return n(e,s)};

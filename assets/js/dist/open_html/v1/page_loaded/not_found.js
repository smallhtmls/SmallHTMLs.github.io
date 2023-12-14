var N=document.getElementById("status"),R=new URLSearchParams(window.location.search),O=R.get("status");if(O)N.innerText=O;else N.innerText="ERR_NOT_FOUND";

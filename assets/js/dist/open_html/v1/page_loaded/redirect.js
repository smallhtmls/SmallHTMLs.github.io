// open_html/v1/assets/js/src/page_loaded/redirect.ts
var params = new URLSearchParams(window.location.search);
var url = params.get("url");
var files = window.top.currFiles;
if (url == null) {
  console.warn("Url parameter 'url' is missing.");
  window.location.href = "not_found.html?status=INVALID_CALL";
} else if (url.startsWith("http")) {
  console.debug("Redirecting to external url: " + url);
  window.location.href = url;
} else {
  console.debug("Redirecting to internal url: " + url);
  const path = decodeURIComponent(url);
  const file = files[path];
  console.debug("Resolved redirect url: " + (file == undefined ? "FILE_NOT_FOUND" : file));
  if (file == undefined)
    window.location.href = "not_found.html?status=FILE_NOT_FOUND";
  else
    window.location.href = file;
}

//# debugId=9271973482E4513964756e2164756e21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vLi4vb3Blbl9odG1sL3YxL2Fzc2V0cy9qcy9zcmMvcGFnZV9sb2FkZWQvcmVkaXJlY3QudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiaW1wb3J0IHsgQ3Vyc2VkRmlsZXMgfSBmcm9tIFwiLi4vYnVuZGxlX2xvYWRlclwiO1xyXG5cclxuY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcclxuY29uc3QgdXJsID0gcGFyYW1zLmdldChcInVybFwiKTtcclxuXHJcbmNvbnN0IGZpbGVzOiBDdXJzZWRGaWxlcyA9IHdpbmRvdy50b3AhLmN1cnJGaWxlcztcclxuXHJcbmlmICh1cmwgPT0gbnVsbCkge1xyXG4gICAgY29uc29sZS53YXJuKFwiVXJsIHBhcmFtZXRlciAndXJsJyBpcyBtaXNzaW5nLlwiKTtcclxuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCJub3RfZm91bmQuaHRtbD9zdGF0dXM9SU5WQUxJRF9DQUxMXCI7XHJcbn0gZWxzZSBpZiAodXJsLnN0YXJ0c1dpdGgoXCJodHRwXCIpKSB7XHJcbiAgICBjb25zb2xlLmRlYnVnKFwiUmVkaXJlY3RpbmcgdG8gZXh0ZXJuYWwgdXJsOiBcIiArIHVybCk7XHJcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHVybDtcclxufSBlbHNlIHtcclxuICAgIGNvbnNvbGUuZGVidWcoXCJSZWRpcmVjdGluZyB0byBpbnRlcm5hbCB1cmw6IFwiICsgdXJsKTtcclxuICAgIGNvbnN0IHBhdGggPSBkZWNvZGVVUklDb21wb25lbnQodXJsKTtcclxuICAgIGNvbnN0IGZpbGUgPSBmaWxlc1twYXRoXTtcclxuICAgIGNvbnNvbGUuZGVidWcoXCJSZXNvbHZlZCByZWRpcmVjdCB1cmw6IFwiICsgKGZpbGUgPT0gdW5kZWZpbmVkID8gXCJGSUxFX05PVF9GT1VORFwiIDogZmlsZSkpO1xyXG5cclxuICAgIGlmIChmaWxlID09IHVuZGVmaW5lZCkgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIm5vdF9mb3VuZC5odG1sP3N0YXR1cz1GSUxFX05PVF9GT1VORFwiO1xyXG4gICAgZWxzZSB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGZpbGU7XHJcbn1cclxuIgogIF0sCiAgIm1hcHBpbmdzIjogIjtBQUVBLElBQU0sU0FBUyxJQUFJLGdCQUFnQixPQUFPLFNBQVMsTUFBTTtBQUN6RCxJQUFNLE1BQU0sT0FBTyxJQUFJLEtBQUs7QUFFNUIsSUFBTSxRQUFxQixPQUFPLElBQUs7QUFFdkMsSUFBSSxPQUFPLE1BQU07QUFDYixVQUFRLEtBQUssaUNBQWlDO0FBQzlDLFNBQU8sU0FBUyxPQUFPO0FBQzNCLFdBQVcsSUFBSSxXQUFXLE1BQU0sR0FBRztBQUMvQixVQUFRLE1BQU0sa0NBQWtDLEdBQUc7QUFDbkQsU0FBTyxTQUFTLE9BQU87QUFDM0IsT0FBTztBQUNILFVBQVEsTUFBTSxrQ0FBa0MsR0FBRztBQUNuRCxRQUFNLE9BQU8sbUJBQW1CLEdBQUc7QUFDbkMsUUFBTSxPQUFPLE1BQU07QUFDbkIsVUFBUSxNQUFNLDZCQUE2QixRQUFRLFlBQVksbUJBQW1CLEtBQUs7QUFFdkYsTUFBSSxRQUFRO0FBQVcsV0FBTyxTQUFTLE9BQU87QUFBQTtBQUN6QyxXQUFPLFNBQVMsT0FBTztBQUFBOyIsCiAgImRlYnVnSWQiOiAiOTI3MTk3MzQ4MkU0NTEzOTY0NzU2ZTIxNjQ3NTZlMjEiLAogICJuYW1lcyI6IFtdCn0=

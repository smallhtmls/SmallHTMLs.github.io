setInterval(() => {
    const title = document.querySelector("title");
    if (title) {
        window.top!.updateWindowTitle(title.innerText);
    }
}, 300);

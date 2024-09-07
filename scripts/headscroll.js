window.onscroll = () => {
    document.querySelectorAll('.headscroll').forEach(
        el => el.classList.add('headscroll--open')
    );
}
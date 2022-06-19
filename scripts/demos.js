(function() {

    document.addEventListener('DOMContentLoaded', domReady);

})();


const SELECTOR_DEMOLINKS = 'a[href^="./demos/"]';

function domReady() {

    const demoLinks = document.querySelectorAll(SELECTOR_DEMOLINKS);

    demoLinks.forEach(addLinkHandler)
}

function addLinkHandler(link) {
    link.addEventListener('click', linkHandler);
}

function linkHandler(evt) {
    const href = evt.target.href;

    evt.preventDefault();

    demoModal(href);
}


function demoModal(demoUrl) {

    const wrapper = document.createElement('div'),
        inner = document.createElement('div'),
        frame = document.createElement('iframe'),
        closer = document.createElement('button');
    
    const closeModal = () => wrapper.parentNode?.removeChild(wrapper);
    closer.addEventListener('click', closeModal);
    closer.textContent = 'close';

    frame.setAttribute('src', demoUrl);

    inner.appendChild(closer);
    inner.appendChild(frame);

    wrapper.appendChild(inner);
    wrapper.className = 'demopop';

    document.body.appendChild(wrapper);
}
import showdown from 'showdown';
import { readFile, writeFile } from 'fs/promises';


const mdConverter = new showdown.Converter();


readFile('src/content.md', 'utf8')
.then( content => {
    const sections = ['home'],
        images = [],
        contentHtml = content
            .split('\n\n')
            .map((section, idx) => {
                const wrap = idx ? 'section' : 'header',
                    sectionId = section
                                .split(/# /g)[1]
                                .replace(/[^\sa-z]/gi)
                                .split(' ')[0]
                                .toLowerCase(),
                    sectionImages = section.match(/\!\[.*\]\(.*\)/gi);

                idx && sections.push(sectionId);

                sectionImages && images.push(...sectionImages.map(parseMdImage))

                return `<${wrap} id="${sectionId}">\n${
                    mdConverter
                        .makeHtml(section)
                        .replace('<p><img', '<img')
                        .replace('/></p>', '/>')
                }\n</${wrap}>`
            }),
        headHtml = loopHTMLSection(
                sections.map(
                    section => ({
                        text: section,
                        href: section === 'home'
                            ? '/'
                            : '#' + section
                    })
                ),
                'nav',
                'a',
            ),
        galleryHtml = `<section>${
            loopHTMLSection(
                images.map(
                    image => ({
                        text: createElement(image, 'img')
                    })
                ),
                'ul',
                'li',
            )
        }</section>`;

    /*console.log(
        
    );*/
    return headHtml
        + '\n\n' + contentHtml.join('\n\n')
        + '\n\n' + galleryHtml
})
.then(contentHtml => {
    Promise.all([
        readFile('src/head.html'),
        readFile('src/foot.html'),
    ]).then(
        ([headHtml, footHtml]) => {
            writeFile(
                'index.html',
                headHtml
                + '\n\n' + contentHtml
                + '\n\n' + footHtml
            )
            .then(() => console.log('markup: success!'))
        }
    )
})


function loopHTMLSection(
    contentArray,
    section = 'div',
    element = 'div'
) {
    return `<${section}>\n${
        contentArray.map(
            content => createElement(
                content,
                element
            )
        ).join('\n')
    }\n</${section}>`
}

function createElement(
    content,
    element
) {
    if (!content) { return }
    if (content.join) { return loopHTMLSection(content)}

    element = content.element || element;

    if (content.split) {
        content = { text: content }
    }

    if (!content.text) {
        return `<${element}${propsToAttrs(content)}/>`
    } else {
        const { text } = content;
        delete content.text;

        return `<${element}${propsToAttrs(content)}>${text}</${element}>`
    }
}

function propsToAttrs(props) {
    const retval = Object.entries(props).map(
            ([key, value]) => `${key}="${value}"`
        ).join(' ')
    return retval ? ' ' + retval : ''
}


function parseMdImage(md) {
    const [alt, src] = md.substr(2, md.length - 3).split('](');
    return { alt, src };
}
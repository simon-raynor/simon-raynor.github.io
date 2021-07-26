import sass from 'node-sass';
import { writeFile } from 'fs/promises';

sass.render({
    file: 'src/css/index.scss',
    style: 'expanded'
}, (err, result) => {
    if (err) { throw new Error(err)}

    writeFile('css/index.css', result.css)
    .then(() => console.log('css: success!'))
})

// use the below for dev:
// TODO: hot reloads
// node-sass -w src/css/index.scss -o css
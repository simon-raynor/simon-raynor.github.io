# TODO LIST:

this project is a WIP, I'm looking to use this as a backbone for replacing the root of this site. It does need work, after all.

## stuff that needs doing before I put this actually live
### (i.e. replace my current homepage with something based on this)

- content! At least *some* real words
- mobile!!
- footer needs finishing, share links adding
- the share meta tags (meta image etc.) need something in them
- the build process needs to be updated to actually generate a CSS file, and probably other tweaks too
- ideally we want to be serving the full, react-rendered markup as index.html, so need to look at SS rendering
- interactivity, maybe some sort of pretend CMS where you can add sections or sth.
- animated hero banner?
- link to Javascroids!
- built output in to a ./public folder, if I can get GH pages to serve that instead of the project route (I'd assume it's possible)
- automated builds + testing? maybe, if I can be bothered?

## note:

If you were looking to build a website like this **you should just use wordpress** (or something similar I guess). There's a good chance you can just buy a theme that's basically what you want and a HUGE community to help you if you need. I've build this to show that I *could*, not to suggest that you *should*. Unless you want to, in which case go wild!

## to run this locally you will need to:

`npm install` then `npm run dev` will build the app. For the time being you will then need to serve it up from somewhere, I recommend `npm install -g http-server` then run it on the root dir but you do you.
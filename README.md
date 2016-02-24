A JSON driven site search engine, no really!


## What is this good for?
When I set out to use Jekyll as the creation/templating engine for my own
personal site, it became very clear that I was going to need a way to
create a static database of searchable data of some kind. The challenge
here is that I am **NOT** using a traditional database to store my pages
or posts in, nor am I using any server side scripting. This means I also
lacked a good way to query this same set of data. Now for the fun part,
to remedy this, while still not needing the overhead of a database on my
webserver, I have my jekyll script copy the title and body data of my
pages into a JSON file. You can see an example below:


```
[
  {
    "type": "page",
    "title": "Math Practice",
    "content": "What type of problem would you like? Random (+) Addition (-) Subtraction (×) Multiplication How many digits? 1 2 3 4 + CheckMore?Skip?",
    "link": "/education/math-practice/"
  },
  {
    "type": "page",
    "title": "Letter - Number Practice",
    "content": "What do you want to practice: Letters Letter Phonics Numbers Start Stop Timer: 0",
    "link": "/education/numbers-letters-practice/"
  }
]
```


While this looks very simplistic at first, the great part is it requires
nothing more than an initial pull of the JSON file and as long as the
file is cached by the clients browser there is no delay other than the
time needed for the javascript searchengine, "jjsearch.js", to crawl the
JSON file. Love it right...You know you do.


## Time/Bandwidth needed to download the data?
Consider the following, gzip, which most webservers and CDNs use to
make internet transmissions, faster will compress plain text very nicely.
As an example one person experimented with many engines and compressing
data that was pulled from a number of locations and data types [[source]](http://binfalse.de/2011/04/04/comparison-of-compression/).
The plain text section notes that he pulled books and source code from
a few projects and proceeded to compress the data with a ratio of ~4:1.
In plain english this means a 40MB file was knocked down to ~10MB


### Working Example
On my site I employ this search engine and the JSON file, as mentioned,
is JSON based and derived at compile time by Jekyll. The file is 85KB
uncompressed and after being gzip'd that drops to 31.5KB. That is a
2.7:1 compression ratio. If you're so inclined, you can download the
JSON file yourself to see an example of the file size and what it
contains.

[search.json](https://progressivethink.in/search.json)


### Wildcards and search format
The default way the engine searches is via a literal search, so
```"hello how are you"```, would only match that exact string. However,
it can also use ```(*, ?, +)``` as a wild card. So ```"Hello*how * are"``` would
match anything that fits the ```"Hello ______ how ______ are"``` pattern.

## Try it out here:
https://progressivethink.in/search/?q=querystring
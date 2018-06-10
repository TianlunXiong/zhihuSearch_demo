
var cheerio = require('cheerio');
var request = require('superagent')

//@cookies_Zhihu.Type == String 为你自己的知乎cookies 可以通过UserAgent获取
var {cookies_Zhihu} = require('./cookies/forZhihu');


async function zhihu_topList(){
    var r = await request.get('https://www.zhihu.com/api/v4/search/top_search').set('cookie',cookies_Zhihu);
    var msg = JSON.parse(r.text);
    var timeStamp = new Date().toLocaleString();
    return {
        timeStamp,
        list: msg["top_search"]["words"]
    }
}

//返回Response中的html
async function zhihu_search(query){
    var url = encodeURI(`https://www.zhihu.com/search?type=content&q=${query}`)
    var r   =  await request.get(url).set('cookie',cookies_Zhihu);
    return r;
}

function extract_searchPage(r){
    var  htmlstr = r.text;
    var _list = [];
    cheerio.load(htmlstr)('h2[class="ContentItem-title"] a','div[class="Card"]').each(function(i,elem){
        var init = cheerio.load(this);
        var text = init.text();
        var href = init('a').attr('href');
        var url  = (/^\/\//.test(href) ? "https:":"https://www.zhihu.com") + href;
        _list[i] = {
            title : text,
            url
        }
    })

    cheerio.load(htmlstr)('div[class="RichContent-inner"] span').each(function(i,elem){
        var init = cheerio.load(this);
        var text = init.text();
        _list[i] = {
            ..._list[i],
            abbr: text
        }
    })

    return _list;
}

zhihu_search("雷军").then(r=>{
    var list = extract_searchPage(r);
    console.log(list);
})

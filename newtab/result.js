import Universal from '../engine/universal.js'
import { Config } from '../engine/config.js'
import { changeTitle } from '../utils/utils.js'

const DEFAULT = ['stackoverflow', 'segmentfault', 'bing', 'google', 'github']
let engineInterface = {}
let searchResult = {}

function init(){
    initEngines(DEFAULT)
    let kw = new URL(window.location.href).searchParams.get('kw')
    batchFetchSearch(kw, 1)

    
    let searchBtn = document.getElementById('serach')
    let searchInput= document.getElementById('searchInput')
    searchInput.value = kw

    searchBtn.addEventListener('click',()=>{
        batchFetchSearch(searchInput.value, 1)
    })
    document.addEventListener('keyup', (e)=>{
        if(e.key == 'Enter'){
            batchFetchSearch(searchInput.value, 1)
        }
    })
}

function initEngines(engines){
    for (let i = 0; i < engines.length; i++) {
        const engineName = engines[i];
        engineInterface[engineName] = new Universal(Config[engineName])
    }
}


// 渲染结果到页面
function renderResult(){
    let contentWrap= document.getElementById('result')
    let rrsrWrap= document.getElementById('rrsr')
    let contentHTML = ''
    let rrsrHTML = ''
    let cc = []
    for (const key in searchResult) {
        if (Object.hasOwnProperty.call(searchResult, key)) {
            const {content, rrsr} = searchResult[key];
            for (let i = 0; i < content.length; i++) {
                const item = content[i];
                cc.push(item)
                let c = `<div class="result_block">
                    <div class="title"><a href="${item.link}" target="_blank">${item.title}</a></div>
                    <div class="content">${item.content}</div>
                    <div class="link">${item.link}</div>
                </div>`

                contentHTML+=c
            }
            for (let i = 0; i < rrsr.length; i++) {
                const item = rrsr[i];
                rrsrHTML += `<a href="#">${item}</a>`
            }
        }
    }
    contentWrap.innerHTML = contentHTML
    rrsrWrap.innerHTML = rrsrHTML
}

function batchFetchSearch(keyword, page){
    changeTitle(keyword)
    let keys = Object.keys(engineInterface)
    let promise_all = []
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        let engine = engineInterface[key]
        promise_all.push(engine.getSearchResult(keyword, page))
    }
    Promise.all(promise_all).then((ress)=>{
        for (let i = 0; i < DEFAULT.length; i++) {
            const key = DEFAULT[i];
            searchResult[key] = ress[i]
        }
        renderResult()
    }).catch((e)=>{
        console.log(e)
    })
}

init()
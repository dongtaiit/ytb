const puppeteer = require('puppeteer');
let Promise = require('bluebird')
const videos = require('./videos.json')

let delay = async(timeout)=>{
    return new Promise((resolve, reject) =>{
        setTimeout(()=>{
            resolve()
        }, timeout)
    })
}

let doSearch = async (page, search) =>{
  await page.goto('https://youtube.com');
  await page.type('#search', search);
//   await Promise.delay(5000)

  await page.click('button[id=search-icon-legacy]')

  await page.waitForXPath("//div[@id='container']/ytd-two-column-search-results-renderer[@class='style-scope ytd-search']/div[@id='primary']/ytd-section-list-renderer[@class='style-scope ytd-two-column-search-results-renderer']/div[@id='contents']")
    .then(()=> delay(1000))

  let selector = "a#video-title"
  await (await page.$(selector)).click().then( () => delay(3000)) 
}

let playVideo = async (browser, search, replay) => {
  const page = await browser.newPage();
  
  
  await doSearch(page, search)

  if(replay){
    setInterval(function(){
      doSearch(page, search + " replay")
    }, replay * 60000)
  }

  while (true) {
    let matrixValue = await page.evaluate(() => window.getComputedStyle(document.querySelector('.ytp-play-progress')).transform)
    let endTimeFlag = matrixValue.slice(6).split(',')[0].slice(1)
    if (endTimeFlag == 1) {
      let replayBtn = "button.ytp-play-button"
      await (await page.$(replayBtn)).click()      
    }
  }
}

let start = async () =>{
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 5,
  });

  videos.map(obj =>{
    playVideo(browser, obj.search, obj.replay)
  })
}

start()
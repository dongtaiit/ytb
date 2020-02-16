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
  console.log('finish search action')
}

let playVideo = async (search, arrTimer, proxies, position) => {
  if(Array.isArray(arrTimer)){
    let index = 0
    while(true){
      if(index == arrTimer.length){
        index = 0;
      }
      let proxy = proxies[index]
      let timeout = arrTimer[index]

      let args = [
        `--window-size=300,300`, 
        `--window-position=${position},0`,
      ]
      
      if(proxy){
        args.push(`--proxy-server=${proxy}`)
      }

      const browser = await puppeteer.launch({
        headless: false,
        slowMo: 5,
        args: args
      });
      let page = await browser.newPage();

      await doSearch(page, search) 

      console.log('timeout', timeout)
      await delay(timeout * 60000)
      console.log('time up')
      await browser.close() //close current page

      index++
    }
  }
  // while (true) {
  //   let matrixValue = await page.evaluate(() => window.getComputedStyle(document.querySelector('.ytp-play-progress')).transform)
  //   let endTimeFlag = matrixValue.slice(6).split(',')[0].slice(1)
  //   if (endTimeFlag == 1) {
  //     let replayBtn = "button.ytp-play-button"
  //     await (await page.$(replayBtn)).click()      
  //   }
  // }
}

let start = async () =>{
  videos.map((obj, idx) =>{
    let position = 500 * idx
    playVideo(obj.search, obj.replay, obj.proxies, position)
  })
}

start()
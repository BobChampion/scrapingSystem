const fs = require('fs');
const https = require('https');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://yandex.ru/images/search?from=tabbar&text=baykal');

  await page.waitForSelector('.serp-item__link');
  await page.click('.serp-item__link');

  await page.setViewport({
    width: 1200,
    height: 800,
  });

  await page.waitForSelector('.MMImage-Origin');
  await page.screenshot({ path: 'screenshot.png' });

  let images = await page.evaluate(() => {
    let imgElements = document.querySelectorAll('.serp-item__thumb');
    let pathsOfImages = Object.values(imgElements).map((imgElement) => ({
      src: imgElement.src,
      alt: imgElement.alt,
    }));

    return pathsOfImages;
  });

  fs.writeFile('imagesURL.json', JSON.stringify(images, null, ' '), (err) => {
    if (err) {
      console.log(err);
    }
  });

  images.forEach((image, index) => {
    const file = fs.createWriteStream(`images/${index}.webp`);
    const request = https.get(image.src, (response) => {
      response.pipe(file);
    });
  });

  await browser.close();
})();

// await page.evaluate(async () => {
//   await new Promise((resolve, reject) => {
//     var totalHeight = 0;
//     var distance = 100;
//     var timer = setInterval(() => {
//       var scrollHeight = document.body.scrollHeight;
//       window.scrollBy(0, distance);
//       totalHeight += distance;
//       if (totalHeight >= scrollHeight) {
//         clearInterval(timer);
//         resolve();
//       }
//     }, 100);
//   });
// });

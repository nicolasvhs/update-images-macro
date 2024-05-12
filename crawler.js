const puppeteer = require('puppeteer');
const os = require('os');
const robot = require("robotjs");
const fs = require('fs');
function getItemsList(filePath) {
  try {
      const data = fs.readFileSync(filePath, 'utf8');
      const lines = data.split(/\r?\n/);
      return lines;
  } catch (err) {
      console.error('Error reading the file:', err);
      return [];
  }
}
const clickButtonFromSpanText = async (page, label) => {
  await page.evaluate(async (label) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const button = buttons.find(button => button.querySelector('span') && button.querySelector('span').textContent.includes(label));
    if (button) {
      button.click();
    }
  }, label);
}

const clickLastDivWithClass = async (page, className) => {
  const divs = await page.$$eval('div.' + className, elements => elements.reverse());
  const lastDiv = divs ? divs[0] : null;
  if (lastDiv) {
    await lastDiv.click();
  } else {
  }
}
const moveAndClick = async (x,y) => {
  // robot.moveMouseSmooth(x, y);
  // robot.mouseClick();

  await page.mouse.click(x, y);
}

const addImage = async (page, image) => {
  await clickButtonFromSpanText(page,"Filtrar");

  await page.click('.wds_1_103_2_TableListItem__optionsContainer');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');

  for (let i = 0; i < 50; i++) {
    await page.keyboard.press('ArrowRight');
  }
  for (let i = 0; i < 50; i++) {
    await page.keyboard.press('Backspace');
  }

  await page.keyboard.type(image);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.evaluate(() => {
    return new Promise(resolve => {
        setTimeout(resolve, 2000);
    });
  });
  clickLastDivWithClass(page, 'multigrid3824412547__row');

  await page.evaluate(() => {
    return new Promise(resolve => {
        setTimeout(resolve, 500);
    });
  });
  moveAndClick(475,475);

  await page.evaluate(() => {
    return new Promise(resolve => {
        setTimeout(resolve, 1000);
    });
  });


  for (let i = 0; i < 13; i++) {
    await page.keyboard.press('Tab');
  }
  await page.keyboard.type(image);
  await page.keyboard.press('Enter');

  await page.evaluate(() => {
    return new Promise(resolve => {
        setTimeout(resolve, 5000);
    });
  });

  await page.waitForSelector('#mediaGalleryFrame');
  const iframeHandle = await page.$('#mediaGalleryFrame');

  const iframeContent = await iframeHandle.contentFrame();

  const selector = `[data-generic-item-name="${image}"]`;
  const elements = await iframeContent.$$(selector);
  if (elements.length > 0) {
    const element = elements[0];

    await element.click(); 
    await new Promise(resolve => setTimeout(resolve, 100));
    await element.click();
    await page.keyboard.press('Enter');
    fs.appendFile('added.txt', image + "\n", (err) => {
      if (err) {
          console.error('Error writing to file:', err);
      } else {
        const now = new Date();
        console.log('Content successfully written to file at ' + now.toLocaleString());
      }
    });
    console.log('Image added');

  } else {
    console.log(image + ' Image not found');
    moveAndClick(1353,185);
  }
  console.log('Finished ' + image);
}

const [ link, browserWSEndpoint] = process.argv.slice(2); 
(async () => {
  try {
    const browser = await puppeteer.connect({ browserWSEndpoint: browserWSEndpoint});
    const pages = await browser.pages();
    const page = pages[0];

    const { width, height } = await page.evaluate(() => ({
      width: window.screen.width,
      height: window.screen.height
    }));
    await page.setViewport({ width: width, height: height });
    
    await page.goto(link);
    await page.evaluate(() => {
      return new Promise(resolve => {
          setTimeout(resolve, 4000);
      });
    });
    const list = getItemsList('images.txt');
    const added = getItemsList('added.txt');
    
    const toAdd = list.filter(element => !added.includes(element));
   
    for(let i = 0; i < toAdd.length; i++){
      await addImage(page, toAdd[i]);
      
    }
  } catch (error) {
    console.error('Error:', error);
  }
})();
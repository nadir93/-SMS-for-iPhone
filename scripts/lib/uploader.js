/**
 * author : @nadir93
 */
const webdriver = require('selenium-webdriver'),
  By = webdriver.By,
  until = webdriver.until;
const chrome = require('selenium-webdriver/chrome');
const path = require('chromedriver').path;
const util = require('util');

const loglevel = 'debug';
const Logger = require('bunyan'),
  log = new Logger.createLogger({
    name: 'uploader',
    level: loglevel
  });

const url = 'https://nid.naver.com/nidlogin.login?url=http%3A%2F%2F' +
  'moneybook.naver.com%2Fmybook%2Fwrite.nhn';
const id = process.env.ID || 'YOUR_NAVER_ID';
const password = process.env.PASSWORD || 'YOUR_NAVER_PASSWORD';
const appBase = '/Users/nadir93/repo/' +
  'naver_moneybook_sms_auto_registration_for_iPhone';

// const service = new chrome.ServiceBuilder(path).build();
// chrome.setDefaultService(service);
// log.debug("chrome initialized");

module.exports = {
  /**
   * 카드사용데이터를 네이버 가계부에 등록한다
   * @param  {[type]} fileName [description]
   * @return {[type]}          [description]
   */
  upload: async fileName => {
    // return new Promise((resolve, reject) => {

    const chromeCapabilities = webdriver.Capabilities.chrome();
    //setting chrome options to start the browser fully maximized
    const chromeOptions = {
      // 'args': ['--test-type', '--start-maximized']
      'args': ['user-data-dir=' + appBase + '/res/chromeSettings']
    };
    chromeCapabilities.set('chromeOptions', chromeOptions);
    const driver = await new webdriver.Builder()
      .withCapabilities(chromeCapabilities)
      .build();

    try {
      await driver.get(url);
      log.debug('first page loaded');
      log.debug('input id');
      const elementID = await driver.wait(until.elementLocated(By.id('id')), 10 * 1000);
      await elementID.sendKeys(id);
      log.debug('input pw');
      const elementPassword = await driver.wait(until.elementLocated(By.id('pw')), 10 * 1000);
      await elementPassword.sendKeys(password);
      log.debug('login ...');
      const elementLogin = await driver
        .wait(until.elementLocated(By.css('input[alt="로그인"]')), 10 * 1000);
      await elementLogin.click();
      log.debug('go to excel popup window');
      const elementImport = await driver
        .wait(until.elementLocated(By.className('btn_import')), 10 * 1000);
      await elementImport.click();

      log.debug('wait popupwindow');
      const handle = await waitPopupWindow(driver);
      log.debug('switch popup window');
      await driver.switchTo().window(handle);

      log.debug('select card');
      const elementCard = await driver
        .findElement(By.css('.selectbox-source > option:nth-child(8)'));
      await elementCard.click();

      log.debug('input excel filename');
      log.debug('file = ' + appBase + '/res/data/' + fileName);
      const elementInput = await driver
        .wait(until
          .elementLocated(By.className('browse-file-input')), 10 * 1000);
      await elementInput.sendKeys(appBase + '/res/data/' + fileName);

      log.debug('submit excel file');
      const elementSubmit = await driver
        .wait(until.elementLocated(By.id('btn_submit')), 10 * 1000);
      await elementSubmit.click();

      log.debug('waiting lastpage');
      await waitLastPage(driver);
    } catch (e) {
      log.error(e);
      throw e;
    } finally {
      log.debug('completed');
      driver.quit();
    }
  }
}

/**
 * [waitPopupWindow description]
 * @param  {[type]} driver [description]
 * @return {[type]}        [description]
 */
async function waitPopupWindow(driver) {
  //return new Promise((resolve, reject) => {

  const retryCount = 100;
  const intervalTime = 1000;
  for (let i = 0; i < retryCount; i++) {
    await pause(intervalTime);
    log.debug('retryCount: ', i);

    const handles = await driver.getAllWindowHandles();
    const popUpWindow = handles[1];
    log.debug('popUpWindow handle: ', popUpWindow);
    if (popUpWindow) {
      log.debug('all handles:', util.inspect(handles));
      return popUpWindow;
    }
  }

  throw new Error('retryCount over');
}

/**
 * 마지막 페이지를 기다린다
 * @param  {[type]} driver [description]
 * @return {[type]}        [description]
 */
async function waitLastPage(driver) {
  // return new Promise((resolve, reject) => {
  const retryCount = 5;
  const intervalTime = 2000;

  for (let i = 0; i < retryCount; i++) {
    await pause(intervalTime);
    log.debug('retryCount: ', i);

    try {
      const el = await driver
        .wait(until.elementLocated(By.className('tit')), 1 * 1000);
      log.debug('element found');
    } catch (e) {
      //log.debug(e);
      return await clickFlachButton(driver);
    }
  }

  throw new Error('retryCount over');
}

function pause(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return resolve();
    }, time); //10초
  })
}

/**
 * 플래쉬버튼을 좌표를 이용하여 누른다
 * @param  {[type]} driver [description]
 * @return {[type]}        [description]
 */
function clickFlachButton(driver) {
  return new Promise((resolve, reject) => {
    var pos_x = 346;
    var pos_y = 380;
    driver
      .actions()
      .mouseMove(driver.findElement(By.name('XlsUpload')), {
        x: pos_x,
        y: pos_y
      })
      .click()
      .perform()
      .then(() => {
        log.debug('confirm button clicked');
        //driver.sleep(1000);
        return resolve();
      }, err => {
        log.error(err);
        return reject(err);
      });
  });
}

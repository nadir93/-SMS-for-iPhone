/**
 * author : @nadir93
 */
var webdriver = require('selenium-webdriver'),
  By = webdriver.By,
  until = webdriver.until;
var chrome = require('selenium-webdriver/chrome');
var path = require('chromedriver').path;
var util = require('util');

var loglevel = 'debug';
var Logger = require('bunyan'),
  log = new Logger.createLogger({
    name: 'uploader',
    level: loglevel
  });

var url = 'https://nid.naver.com/nidlogin.login?url=http%3A%2F%2F' +
  'moneybook.naver.com%2Fmybook%2Fwrite.nhn';
var id = YOUR_ID;
var password = YOUR_PASSWORD;

var chromeCapabilities = webdriver.Capabilities.chrome();
//setting chrome options to start the browser fully maximized
var chromeOptions = {
  // 'args': ['--test-type', '--start-maximized']
  'args': ['--user-agent = Mozilla/5.0 (Windows; U; Windows NT 6.1; ko; rv:1.9.2.8) Gecko/20100722 Firefox/3.6.8 IPMS/A640400A-14D460801A1-000000426571']
};
chromeCapabilities.set('chromeOptions', chromeOptions);
var driver = new webdriver.Builder()
  .withCapabilities(chromeCapabilities)
  .build();


driver.get("chrome://settings/content/flash")
  .then(() => {
    return driver
      .wait(until.elementLocated(By.id('addSite')), 10 * 10000)
      .click();
    //return driver.get(url);
  })
  .then(function () {
    log.debug("first page loaded");
    log.debug("input id");
    return driver.wait(until.elementLocated(By.id('id')), 10 * 10000)
      .sendKeys(id);
  })
  .then(function () {
    log.debug("input pw");
    return driver.wait(until.elementLocated(By.id('pw')), 10 * 1000)
      .sendKeys(password)
  })
  .then(function () {
    log.debug("logging ...");
    return driver
      .wait(until.elementLocated(By.css('input[alt="로그인"]')), 10 * 1000)
      .click();
  })
  .then(function () {
    log.debug("go to excel popup window");
    return driver
      .wait(until.elementLocated(By.className('btn_import')), 10 * 1000)
      .click();
  })
  .then(function () {
    log.debug("wait popupwindow");
    return waitPopupWindow(driver);
  })
  .then(function (handle) {
    log.debug("switch popup window");
    return driver.switchTo().window(handle);
  })
  .then(function () {
    log.debug("select card");
    return driver
      .findElement(By.css('.selectbox-source > option:nth-child(8)'))
      .click();
  })
  .then(function () {
    log.debug("input excel filename");
    log.debug("file = " + __dirname + '/data/' + fileName);
    return driver
      .wait(until
        .elementLocated(By.className('browse-file-input')), 10 * 1000)
      .sendKeys(__dirname + '/data/' + fileName);
  })
  .then(function () {
    log.debug("submit excel file");
    return driver
      .wait(until.elementLocated(By.id('btn_submit')), 10 * 1000)
      .click();
  })
  .then(function () {
    log.debug("waiting lastpage");
    return waitLastPage(driver);
  })
  .then(function () {
    log.debug("completed");
    //driver.quit();
    //resolve();
  })
  .catch(function (e) {
    log.error(e);
    //driver.quit();
    //reject(e);
  });

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
var id = process.env.ID || "YOUR_NAVER_ID";
var password = process.env.PASSWORD || "YOUR_NAVER_PASSWORD";

var service = new chrome.ServiceBuilder(path).build();
chrome.setDefaultService(service);

module.exports = {
  /**
   * 카드사용데이터를 네이버 가계부에 등록한다
   * @param  {[type]} fileName [description]
   * @return {[type]}          [description]
   */
  upload: function(fileName) {
    return new Promise(function(resolve, reject) {
      var driver = new webdriver.Builder()
        .withCapabilities(webdriver.Capabilities.chrome())
        .build();

      driver.get(url).then(function() {
          log.debug("first page loaded");
          log.debug("input id");
          return driver.wait(until.elementLocated(By.id('id')), 10 * 1000)
            .sendKeys(id);
        })
        .then(function() {
          log.debug("input pw");
          return driver.wait(until.elementLocated(By.id('pw')), 10 * 1000)
            .sendKeys(password)
        })
        .then(function() {
          log.debug("logging ...");
          return driver
            .wait(until.elementLocated(By.css('input[alt="로그인"]')), 10 * 1000)
            .click();
        })
        .then(function() {
          log.debug("go to excel popup window");
          return driver
            .wait(until.elementLocated(By.className('btn_import')), 10 * 1000)
            .click();
        })
        .then(function() {
          log.debug("wait popupwindow");
          return waitPopupWindow(driver);
        })
        .then(function(handle) {
          log.debug("switch popup window");
          return driver.switchTo().window(handle);
        })
        .then(function() {
          log.debug("select card");
          return driver
            .findElement(By.css('.selectbox-source > option:nth-child(8)'))
            .click();
        })
        .then(function() {
          log.debug("input excel filename");
          log.debug("file = " + __dirname + '/data/' + fileName);
          return driver
            .wait(until
              .elementLocated(By.className('browse-file-input')), 10 * 1000)
            .sendKeys(__dirname + '/data/' + fileName);
        })
        .then(function() {
          log.debug("submit excel file");
          return driver
            .wait(until.elementLocated(By.id('btn_submit')), 10 * 1000)
            .click();
        })
        .then(function() {
          log.debug("waiting lastpage");
          return waitLastPage(driver);
        })
        .then(function() {
          log.debug("completed");
          driver.quit();
          resolve();
        })
        .catch(function(e) {
          log.error(e);
          driver.quit();
          reject(e);
        });
    });
  }
}

/**
 * [waitPopupWindow description]
 * @param  {[type]} driver [description]
 * @return {[type]}        [description]
 */
function waitPopupWindow(driver) {
  return new Promise(function(resolve, reject) {
    var retryCount = 10;
    var intervalTime = 1000;
    var intervalJob = setInterval(function() {
      log.debug('retryCount = ' + retryCount);
      if (retryCount > 0) {
        driver.getAllWindowHandles()
          .then(function(handles) {
            var popUpWindow = handles[1];
            log.debug('popUpWindow handle = ' + popUpWindow);
            if (popUpWindow) {
              log.debug('all handles = ' + util.inspect(handles));
              resolve(popUpWindow);
              clearInterval(intervalJob);
            }
          });
      } else {
        reject(new Error("retryCount over"));
        clearInterval(intervalJob);
      }
      retryCount--;
    }, intervalTime);
  });
}

/**
 * 마지막 페이지를 기다린다
 * @param  {[type]} driver [description]
 * @return {[type]}        [description]
 */
function waitLastPage(driver) {
  return new Promise(function(resolve, reject) {
    var retryCount = 5;
    var intervalTime = 2000;
    var intervalJob = setInterval(function() {
      log.debug('retryCount = ' + retryCount);
      if (retryCount > 0) {
        driver
          .wait(until.elementLocated(By.className('tit')), 1 * 1000)
          .then(function(el) {
            log.debug('element found');
            resolve();
            clearInterval(intervalJob);
          }, function(err) {
            log.debug(err);
            clickFlachButton(driver);
          })
      } else {
        reject(new Error("retryCount over"));
        clearInterval(intervalJob);
      }
      retryCount--;
    }, intervalTime);
  });
}

/**
 * 플래쉬버튼을 좌표를 이용하여 누른다
 * @param  {[type]} driver [description]
 * @return {[type]}        [description]
 */
function clickFlachButton(driver) {
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
    .then(function() {
      log.debug("confirm button clicked");
      //driver.sleep(1000);
    }, function(err) {
      log.error("error = " + err);
    });
}

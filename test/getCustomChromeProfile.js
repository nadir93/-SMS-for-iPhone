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

var url = 'chrome://settings/content';
var id = 'YOUR_ID';
var password = 'YOUR_PASSWORD';

var chromeCapabilities = webdriver.Capabilities.chrome();
//setting chrome options to start the browser fully maximized
// TODO: 커스텀 프로파일을 생성하여 flash 허용 싸이트를 먼저 등록해줘야 한다.
var chromeOptions = {
  // 'args': ['--test-type', '--start-maximized']
  'args': ['user-data-dir=/Users/nadir93/repo/EXPENSE_BOT/test/customProfile']
};
chromeCapabilities.set('chromeOptions', chromeOptions);
var driver = new webdriver.Builder()
  .withCapabilities(chromeCapabilities)
  .build();

driver.get(url)
  .then(function () {
    log.debug("first page loaded");
    log.debug("input id");
    return driver.wait(until.elementLocated(By.id('id')), 10 * 100000)
      .sendKeys(id);
  })
  .then(function () {
    log.debug("completed");
    driver.quit();
    //resolve();
  })
  .catch(function (e) {
    log.error(e);
    driver.quit();
    //reject(e);
  });

// driver.get("chrome://settings/content")
//   .then(() => {
//     return driver
//       .wait(until.elementLocated(By.id('addSite')), 10 * 30000)
//       .click();
//     //return driver.get(url);
//   })
//   .catch(e => console.error);

// ChromeOptions options = new ChromeOptions();
// options.addArguments("user-data-dir=/give/any/path/for/Profile");
// WebDriver driver = new ChromeDriver(options);
// driver.get("chrome://settings/content");
// 2) Here put a sleep
// for few seconds.
// Thread.sleep(10000);
// 3) Manually enable the 'Allow sits to run Flash'
// radiobox.
// 4) quit the driver.

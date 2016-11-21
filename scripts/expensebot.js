/**
 * author : @nadir93
 */
var loglevel = 'debug';
var Logger = require('bunyan'),
  log = new Logger.createLogger({
    name: 'expensebot',
    level: loglevel
  });
var util = require('util');
var fs = require('fs');
var excel = require('./lib/excel');
var uploader = require('./lib/uploader');

module.exports = function(robot) {

  robot.hear(/(.*)/i, function(msg) {
    log.debug('request', {
      message: msg.message.text,
      user: msg.message.user.name,
      channel: msg.message.user.room
    });

    var content = makeTransactionObject(msg);

    if (content.title != '[Web발신]' || !content.card ||
      !content.name || !content.store || !content.amount ||
      !content.sum || !content.time) {
      log.error('카드매출 데이타가 아닙니다');
      msg.send({
        "attachments": [{
          "pretext": "*에러발생*",
          "fallback": "에러발생",
          "fields": [{
            //"title": "에러발생",
            "value": '카드매출 데이타가 아닙니다',
            "short": false
          }],
          "mrkdwn_in": ["text", "pretext", "fields"],
          "color": "danger"
        }]
      });
      return;
    }

    //write excel
    var fileName = excel.writeFile(content);
    log.debug('fileName = ' + fileName);

    /**
     * upload excel file
     */
    uploader.upload(fileName)
      .then(function() {
        log.debug('message respond');
        msg.send({
          "attachments": [{
            //"title": "trlog get {전화번호}",
            //"pretext": "trlogbot 사용법",
            //"text": "```ex) trlog get 821021805043\n response : TRLog 전송 요청이 완료되었습니다```",
            "fallback": "카드사용명세서",
            "fields": [{
              "title": "카드사",
              "value": content.card,
              "short": true
            }, {
              "title": "이름",
              "value": content.name,
              "short": true
            }, {
              "title": "일시",
              "value": content.time,
              "short": true
            }, {
              "title": "사용장소",
              "value": content.store,
              "short": true
            }, {
              "title": "금액",
              "value": "`" + content.amount + "`",
              "short": false
            }],
            "mrkdwn_in": ["text", "pretext", "fields"],
            "color": "good"
          }]
        });
      })
      .catch(function(e) {
        log.error(e);
        msg.send({
          "attachments": [{
            "pretext": "*에러발생*",
            "fallback": "에러발생",
            "fields": [{
              //"title": "에러발생",
              "value": e.message,
              "short": false
            }],
            "mrkdwn_in": ["text", "pretext", "fields"],
            "color": "danger"
          }]
        });
      })
  });

  robot.respond(/(.*)/i, function(msg) {

    log.debug('request', {
      message: msg.message.text,
      user: msg.message.user.name,
      channel: msg.message.user.room
    });
  });

  robot.respond(/is it (weekend|holiday)\s?\?/i, function(msg) {

    log.debug('request', {
      message: msg.message.text,
      user: msg.message.user.name,
      channel: msg.message.user.room
    });

    var today = new Date();
    var res = today.getDay() === 0 || today.getDay() === 6 ? "YES" : "NO";
    msg.reply(res);
    log.debug('response', {
      message: res
    });
  });

  robot.respond(/command$/i, function(msg) {

    log.debug('request', {
      message: msg.message.text,
      user: msg.message.user.name,
      channel: msg.message.user.room
    });

    // var message = 'sys [hostname]\n' +
    //     'test [projectname] [hostname]\n' +
    //     'forever list [hostname]\n' +
    //     'tail status [file] [hostname]\n' +
    //     'redis get [key]\n' +
    //     'redis stat\n' +
    //     'monitor (user|mqttbroker|userstat|mqttbrokerstat|stat)\n' +
    //     'monitor user (get|post|delete|put)\n' +
    //     'monitor mqttbroker (get|post|delete|put)\n' +
    //     'trlog get [phoneNumber]\n' +
    //     '수조온도\n';
    // msg.reply(message);

    msg.send({
      "attachments": [{
        //"title": "trlog get {전화번호}",
        //"pretext": "trlogbot 사용법",
        //"text": "```ex) trlog get 821021805043\n response : TRLog 전송 요청이 완료되었습니다```",
        "fallback": "명령어 리스트",
        "fields": [{
          "title": "명령어 리스트",
          "value": "`sys` `mon` `log` `forever` `hotdeal`",
          "short": false
        }],
        "mrkdwn_in": ["text", "pretext", "fields"],
        "color": "good"
      }]
    });

    // log.debug('response', {
    //     message: message
    // });
  });
}

/**
 * 메시지를 파싱하여 객체로 변환한다
 * @param  {[type]} msg [description]
 * @return {[type]}     [description]
 */
function makeTransactionObject(msg) {
  var array = msg.message.text.split('\n');
  //var content = JSON.parse(msgArray);
  //log.debug('content = ' + content);

  for (i = 0; i < array.length; i++) {
    log.debug('msg[' + i + '] = ' + array[i]);
  }

  var content = {};
  content.title = array[0];
  content.card = array[1];
  content.name = array[2];
  content.time = array[3];
  content.amount = array[4];
  content.sum = array[5];
  content.store = array[6];

  log.debug('content = ' + util.inspect(content));
  return content;
}

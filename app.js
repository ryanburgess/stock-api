var express = require('express');
var app = express();
var cheerio = require('cheerio');
var request = require('request');
var stock = [];
app.get('/', function (req, res) {
  res.send('<a href="/api/?s=NFLX">Stock API</a><p>Using the end point /api/?s= and passing a stock symbol in the query the API will return a JSON response</p>');
});
app.get('/api/', function (req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  var qr = req.query.s;
  
  if(qr !== undefined){
      request({
      method: 'GET',
      url: 'http://finance.yahoo.com/q?s=' + qr
    }, function(err, response, body) {
      if (err) return console.error(err);

      if(stock.length > 0){
        stock = [];
      }

      $ = cheerio.load(body);
      var stockNum = $('.time_rtq_ticker').text();
      var title = $('#yfi_rt_quote_summary .title').text();
      var rtq = $('#yfi_rt_quote_summary .time_rtq_content').text();

      rtq = rtq.split('(');
      var price = rtq[0].trim();
      var percent = rtq[1].replace(')', '');
      var updated = $('#yfs_t53_nflx').text();
      var prev = $('#table1').find('td').eq(0).text();
      var open = $('#table1').find('td').eq(1).text();
      var bid = $('#table1').find('td').eq(2).text();

      var upDown;
      if($('#yfi_rt_quote_summary .time_rtq_content').hasClass('down_r')){
        upDown = 'down';
      }else{
        upDown = 'up';
      }
      stock.push({company: title, symbol: qr, stock_number: stockNum, price_change: price, percent_change: percent, up_down: upDown, updated: updated, previous: prev, open: open, bid: bid})
      
    });
  }else{
    stock = [];
    stock.push({error: 'stock symbol is undefined'})
  }
  res.send(JSON.stringify(stock, null, 4));
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('listening on port ' + port);
});

const expect = require('expect');
var request = require('request');

it('should return status_code:400 while name field missing => getDateWiseScores', (done)=> {
    request.get('http://localhost:5000/api/getDateWiseScores',function (error, response, body) {
        var json = JSON.parse(body);
        var status_code = json.status_code;
        expect(status_code).toBe(400);
        done();
    });
})

it('should return status_code:200 while data found => getDateWiseScores', (done)=> {
    request.get('http://localhost:5000/api/getDateWiseScores?name=AmazonIN', function (error, response, body) {
        var json = JSON.parse(body);
        var status_code = json.status_code;
        expect(status_code).toBe(200);
        done();
    });
})

it('should return status_code:200 and msg will be empty while data not found => getDateWiseScores', (done)=> {
    request.get('http://localhost:5000/api/getDateWiseScores?name=abcd', function (error, response, body) {
        var json = JSON.parse(body);
        var status_code = json.status_code;
        expect(status_code).toBe(200);
        done();
    });
})
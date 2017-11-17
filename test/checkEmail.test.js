const expect = require('expect');
var request = require('request');

it('should return status_code:200 while email found', (done)=> {
    request.post('http://localhost:5000/api/checkEmail',{form: {email: "montu3366@gmail.com"}}, function (error, response, body) {
        var json = JSON.parse(body);
        var status_code = json.status_code;
        expect(status_code).toBe(200);
        done();
    });
})

it('should return status_code:400 while email field not passed', (done)=> {
    request.post('http://localhost:5000/api/checkEmail',{form: {}}, function (error, response, body) {
        var json = JSON.parse(body);
        var status_code = json.status_code;
        expect(status_code).toBe(400);
        done();
    });
})

it('should return status_code:404 while email not found', (done)=> {
    request.post('http://localhost:5000/api/checkEmail',{form: {email : "montu3366"}}, function (error, response, body) {
        var json = JSON.parse(body);
        var status_code = json.status_code;
        expect(status_code).toBe(404);
        done();
    });
})
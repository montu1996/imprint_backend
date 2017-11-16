const expect = require('expect');
var request = require('request');

it('should return status_code:200 while data found in login', (done)=> {
    request.post('http://localhost:5000/api/login',{form: {email: "montu3366@gmail.com", password: "montu123"}}, function (error, response, body) {
        
        var json = JSON.parse(body);
        var status_code = json.status_code;
        expect(status_code).toBe(200);
        done();
    });
})

it('should return status_code:404 while email and password not found', (done)=> {
    request.post('http://localhost:5000/api/login',{form: {email: "moddntu3366@gmail.com", password: "mgggontu123"}}, function (error, response, body) {
        
        var json = JSON.parse(body);
        var status_code = json.status_code;
        expect(status_code).toBe(404);
        done();
    });
})

it('should return status_code:400 while field missing', (done)=> {
    request.post('http://localhost:5000/api/login',{form: {}}, function (error, response, body) {
        
        var json = JSON.parse(body);
        var status_code = json.status_code;
        expect(status_code).toBe(400);
        done();
    });
})

it('should return status_code:404 while password not match', (done)=> {
    request.post('http://localhost:5000/api/login',{form: {email: "moddntu3366@gmail.com", password: "mgggontu123"}}, function (error, response, body) {
        var json = JSON.parse(body);
        var status_code = json.status_code;
        expect(status_code).toBe(404);
        done();
    });
})
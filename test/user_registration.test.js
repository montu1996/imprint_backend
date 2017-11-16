const expect = require('expect');
var request = require('request');

// it('should return status_code:200 while email found', (done)=> {
//     request.post('http://localhost:5000/api/user_registration',{form: {email: "test", password: "test1", confirm_password: "test1"}}, function (error, response, body) {
//         var json = JSON.parse(body);
//         var status_code = json.status_code;
//         expect(status_code).toBe(200);
//         done();
//     });
// })

it('should return status_code:400 while some field missing', (done) => {
    request.post('http://localhost:5000/api/user_registration', {form: {email: "test"} }, function (error, response, body) {
        var json = JSON.parse(body);
        var status_code = json.status_code;
        expect(status_code).toBe(400);
        done();
    });
})

it('should return status_code:400 while already register', (done)=> {
    request.post('http://localhost:5000/api/user_registration',{form: {email: "montu3366@gmail.com", password: "montu123", confirm_password: "montu123"}}, function (error, response, body) {
        var json = JSON.parse(body);
        var status_code = json.status_code;
        expect(status_code).toBe(400);
        done();
    });
})

it('should return status_code:400 while password and confirm_password not match', (done)=> {
    request.post('http://localhost:5000/api/user_registration',{form: {email: "test@gmail.com", password: "montu123", confirm_password: "montu1123"}}, function (error, response, body) {
        var json = JSON.parse(body);
        var status_code = json.status_code;
        expect(status_code).toBe(400);
        done();
    });
})
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var follow_redirects_1 = require("follow-redirects");
var index_1 = require("./index");
var Xhr = /** @class */ (function () {
    function Xhr() {
        this._rateLimiter = null;
    }
    Xhr.prototype.withRateLimiter = function (limiter) {
        this._rateLimiter = limiter;
        return this;
    };
    Xhr.prototype.request = function (request) {
        var _this = this;
        var xhr = null;
        var options = request.toHttpOptions();
        if (request.https === true) {
            xhr = follow_redirects_1.https;
        }
        else {
            xhr = follow_redirects_1.http;
        }
        var sendRequest = function () {
            var promise = new Promise(function (resolve, reject) {
                var req = (xhr.request(options)
                    .on('timeout', function () {
                    req.abort();
                    reject(new index_1.HttpError('Http request timed out'));
                })
                    .on('abort', function () { return reject(new index_1.HttpError('Http request aborted')); })
                    .on('error', function (error) { return reject(new index_1.HttpError("Http request errored - " + error.message)); })
                    .on('close', function () { return reject(new index_1.HttpError('Http request closed')); })
                    .on('response', function (response) {
                    var code = response.statusCode || 0;
                    if (code >= 200 && code < 300) {
                        var dataSequence_1 = [];
                        response
                            .on('aborted', function () { return reject(new index_1.HttpError('Http request aborted')); })
                            .on('error', function (error) { return reject(new index_1.HttpError(error.message)); })
                            .on('data', function (data) { return dataSequence_1.push(data); })
                            .on('end', function () {
                            var url = "" + request.host + request.path;
                            var method = request.method;
                            var data = Buffer.concat(dataSequence_1);
                            var res = (index_1.ResponseBuilder.start()
                                .withHttpResponse(response)
                                .withUrl(url)
                                .withMethod(method)
                                .withData(data)
                                .build());
                            resolve(res);
                        });
                    }
                    else {
                        reject((new index_1.HttpError("Http status " + code)).withStatus(code));
                    }
                }));
                if (request.data) {
                    req.write(request.data);
                }
                req.end();
            });
            return promise;
        };
        var result = new Promise(function (resolve) {
            if (_this._rateLimiter !== null) {
                var task = function () { resolve(sendRequest()); };
                _this._rateLimiter.add(task);
            }
            else {
                resolve(sendRequest());
            }
        });
        return result;
    };
    return Xhr;
}());
exports.Xhr = Xhr;

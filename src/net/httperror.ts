export class HttpError extends Error {

    private _code:      string;
    private _status:    number;

    public constructor(...args: any) {
        super(...args);
        this._code = 'ERR_HTTP_CONN';
        this._status = 0;

        Object.setPrototypeOf(this, HttpError.prototype);
    }

    withStatus(status: number): this {
        this._status = status;
        return this;
    }

    get code(): string {
        return this._code;
    }

    get status(): number {
        return this._status;
    }

}

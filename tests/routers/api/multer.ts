export class Router extends GSD.GledeRouter {
    @GSD.Post('/file')
    @GSD.Multer({
        limits: {
            fileSize: 10 * 1024 * 1024
        }
    }, {
        single: 'file'
    })
    file(this: GledeThis, data: GledeReqData) {
        console.log(data)
        return {code: 0, data: null};
    }
}
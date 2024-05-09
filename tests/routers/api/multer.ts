export class Router extends GSD.GledeRouter {
    @GSD.Post('/file')
    @GSD.Multer(
        {
            limits: {
                fileSize: 10 * 1024 * 1024
            },
            // storageOpts: {
            //     destination: 'tmp',
            //     filename() {}
            // }
        },
        { single: 'file'}
    )
    file(this: GledeThis, data: GledeReqData) {
        console.log(this.req.file)
        return {code: 0, data: null};
    }
}

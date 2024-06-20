declare module 'image-thumbnail' {
    export type Options = {
        percentage?: number;
        width?: number;
        height?: number;
        responseType?: 'buffer' | 'base64';
        jpegOptions?: {
            quality?: number;
            progressive?: boolean;
            force?: boolean;
        };
        fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
        failOnError?: boolean;
        withMetaData?: boolean;
    };

    export type Source = Buffer | fs.ReadStream | stream.PassThrough;

    function imageThumbnail(source: Source, options?: Options): Promise<Buffer | string>;

    export default imageThumbnail;
}
import { ReadStream, PassThrough } from 'stream';
import { SharpOptions, JpegOptions } from 'sharp';

interface ThumbnailOptions {
    percentage?: number;
    width?: number;
    height?: number;
    responseType?: 'buffer' | 'base64';
    jpegOptions?: JpegOptions;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    failOnError?: boolean;
    withMetaData?: boolean;
}

interface UriSource {
    uri: string;
}

declare function imageThumbnail(source: Buffer | ReadStream | PassThrough | UriSource | string, options?: ThumbnailOptions): Promise<Buffer | string>;

export { imageThumbnail };
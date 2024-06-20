import fs from 'fs';
import { PassThrough } from 'stream';
import sizeOf from 'image-size';
import sharp from 'sharp';
import validator from 'validator';
import axios from 'axios';
import * as util from './util.js';
import { fail } from 'assert';

const PERCENTAGE = 10;
const RESPONSE_TYPE = 'buffer';

const fromBase64 = async (source, percentage, width, height, responseType, jpegOptions, fit, failOnError, withMetaData) => {
    const imageBuffer = Buffer.from(source, 'base64');
    const dimensions = getDimensions(imageBuffer, percentage, { width, height });
    const thumbnailBuffer = await sharpResize(imageBuffer, dimensions, jpegOptions, fit, failOnError, withMetaData);

    if (responseType === 'base64') {
        return thumbnailBuffer.toString('base64');
    }

    return thumbnailBuffer;
};

const fromUri = async (source, percentage, width, height, responseType, jpegOptions, fit, failOnError, withMetaData) => {
    const response = await axios.get(source.uri, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');

    const dimensions = getDimensions(imageBuffer, percentage, { width, height });
    const thumbnailBuffer = await sharpResize(imageBuffer, dimensions, jpegOptions, fit, failOnError, withMetaData);

    if (responseType === 'base64') {
        return thumbnailBuffer.toString('base64');
    }

    return thumbnailBuffer;
};

const fromPath = async (source, percentage, width, height, responseType, jpegOptions, fit, failOnError, withMetaData) => {
    const imageBuffer = fs.readFileSync(source);

    const dimensions = getDimensions(imageBuffer, percentage, { width, height });
    const thumbnailBuffer = await sharpResize(imageBuffer, dimensions, jpegOptions, fit, failOnError, withMetaData);

    if (responseType === 'base64') {
        return thumbnailBuffer.toString('base64');
    }

    return thumbnailBuffer;
};

const fromReadStream = async (source, percentage, width, height, responseType, jpegOptions, fit, failOnError, withMetaData) => {
    const imageBuffer = await util.streamToBuffer(source);
    const dimensions = getDimensions(imageBuffer, percentage, { width, height });
    const thumbnailBuffer = await sharpResize(imageBuffer, dimensions, jpegOptions, fit, failOnError, withMetaData);

    if (responseType === 'base64') {
        return thumbnailBuffer.toString('base64');
    }

    return thumbnailBuffer;
};

const fromBuffer = async (source, percentage, width, height, responseType, jpegOptions, fit, failOnError, withMetaData) => {
    const imageBuffer = source;

    const dimensions = getDimensions(imageBuffer, percentage, { width, height });
    const thumbnailBuffer = await sharpResize(imageBuffer, dimensions, jpegOptions, fit, failOnError, withMetaData);

    if (responseType === 'base64') {
        return thumbnailBuffer.toString('base64');
    }

    return thumbnailBuffer;
};

const imageThumbnail = async (source, options) => {
    const percentage = options && options.percentage ? options.percentage : PERCENTAGE;
    const width = options && options.width ? options.width : undefined;
    const height = options && options.height ? options.height : undefined;
    const responseType = options && options.responseType ? options.responseType : RESPONSE_TYPE;
    const jpegOptions = options && options.jpegOptions ? options.jpegOptions : undefined;
    const fit = options && options.fit ? options.fit : undefined;
    const failOnError = options && typeof(options.failOnError) !== 'undefined' ? options.failOnError : true;
    const withMetaData = options && typeof(options.withMetaData) !== 'undefined' ? options.withMetaData : false;

    try {
        switch (typeof source) {
            case 'object':
                let response;
                if (source instanceof fs.ReadStream || source instanceof PassThrough) {
                    response = await fromReadStream(source, percentage, width, height, responseType, jpegOptions, fit, failOnError, withMetaData);
                } else if (source instanceof Buffer) {
                    response = await fromBuffer(source, percentage, width, height, responseType, jpegOptions, fit, failOnError, withMetaData);
                } else {
                    response = await fromUri(source, percentage, width, height, responseType, jpegOptions, fit, failOnError, withMetaData);
                }
                return response;
            case 'string':
                if (validator.isBase64(source)) {
                    return await fromBase64(source, percentage, width, height, responseType, jpegOptions, fit, failOnError, withMetaData);
                } else {
                    return await fromPath(source, percentage, width, height, responseType, jpegOptions, fit, failOnError, withMetaData);
                }
            default:
                throw new Error('unsupported source type');
        }
    } catch (err) {
        throw new Error(err.message);
    }
};

const getDimensions = (imageBuffer, percentageOfImage, dimensions) => {
    if (typeof dimensions.width != 'undefined' || typeof dimensions.height != 'undefined') {
        return util.removeUndefined(dimensions);
    }

    const originalDimensions = sizeOf(imageBuffer);

    const width = parseInt((originalDimensions.width * (percentageOfImage / 100)).toFixed(0));
    const height = parseInt((originalDimensions.height * (percentageOfImage / 100)).toFixed(0));

    return { width, height };
}

const sharpResize = (imageBuffer, dimensions, jpegOptions, fit, failOnError, withMetadata) => {
    return new Promise((resolve, reject) => {
        let result = sharp(imageBuffer, { failOnError })
            .flatten({background: { r: 255, g: 255, b: 255, alpha: 1 }})
            .resize({
                ...dimensions, withoutEnlargement: true, fit: fit ? fit : 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 },
            });

        if(withMetadata){
            result = result.withMetadata();
        }

        result.jpeg(jpegOptions ? jpegOptions : { force: false })
            .toBuffer((err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
    });
};

export { imageThumbnail, fromBase64, fromUri, fromPath, fromReadStream, fromBuffer };
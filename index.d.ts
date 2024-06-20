declare module 'image-thumbnail' {
	import { SharpOptions, FitEnum } from 'sharp';
	import { AxiosRequestConfig } from 'axios';
  
	interface Dimensions {
	  width: number;
	  height: number;
	}
  
	interface JpegOptions {
	  quality?: number;
	  progressive?: boolean;
	  chromaSubsampling?: string;
	}
  
	type FitOptions = keyof typeof FitEnum;
  
	export function fromBase64(
	  source: string,
	  percentage: number,
	  width: number,
	  height: number,
	  responseType: 'buffer' | 'base64',
	  jpegOptions: JpegOptions,
	  fit: FitOptions,
	  failOnError: boolean,
	  withMetaData: boolean
	): Promise<Buffer | string>;
  
	export function fromUri(
	  source: { uri: string },
	  percentage: number,
	  width: number,
	  height: number,
	  responseType: 'buffer' | 'base64',
	  jpegOptions: JpegOptions,
	  fit: FitOptions,
	  failOnError: boolean,
	  withMetaData: boolean
	): Promise<Buffer | string>;
  }
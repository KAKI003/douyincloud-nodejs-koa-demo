import crypto from 'crypto';

/*
    参数示例，params对应url里的query参数
    const params = {
        "nonce":     "1234567890",
        "timestamp": "1717038098",
        "openid":    "ab-cdefghijk",
        "appid":     "tt123456789",
    }
    const secret = "secret"
*/

// 请求头签名计算时bodyStr为空字符串， 响应头签名计算时bodyStr为对应响应体字符串
export const getSignature = (params: SignatureParams, bodyStr: string, secret: string): string => {
    const keys = Object.keys(params).sort();
    const kvList = keys.map(key => `${key}=${(params as any)[key]}`);
    const urlParams = kvList.join('&');
    const rawData = urlParams + bodyStr + secret;
    const md5sum = crypto.createHash('md5');
    md5sum.update(rawData);
    const md5Result = md5sum.digest();
    return Buffer.from(md5Result).toString('base64');
}

// 导出接口供其他文件使用
export interface SignatureParams {
    nonce: string;
    timestamp: string;
    openid: string;
    appid: string;
}

// 验证请求签名
export const verifySignature = (signature: string, params: SignatureParams, secret: string): boolean => {
    const expectedSignature = getSignature(params, '', secret);
    return signature === expectedSignature;
};


import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from '@koa/router'
import { verifySignature, SignatureParams, getSignature } from './signature';

const app = new Koa();
const router = new Router();
router.get('/', ctx => {
    ctx.body = `TEST SUCCESS`;
}).get('/api/feed_game/scenes', async (ctx: any) => {
    try {
        const nonce = ctx.query.nonce as string;
        const timestamp = ctx.query.timestamp as string;
        const openid = ctx.query.openid as string;
        const appid = ctx.query.appid as string;
        const signature = ctx.request.header['x-signature'] as string;
        
        if (!nonce || !timestamp || !openid || !appid || !signature) {
            ctx.status = 200;
            ctx.body = {
                err_no: 28001007,
                err_msg: "invalid param",
                data: {
                    scenes: []
                }
            };
            return;
        }
        
        const secretKey = 'd48d960268bb3dbb2d05cbeeb3ac2c209919d261';
        const signatureParams: SignatureParams = { nonce, timestamp, openid, appid };
        const isValidSignature = verifySignature(signature, signatureParams, secretKey);
        if (!isValidSignature) {
            ctx.status = 200;
            ctx.body = {
                err_no: 28006009,
                err_msg: "check signature failed",
                data: {
                    scenes: []
                }
            };
            return;
        }
        
       
        const scenes = [];
        
        // 模拟重要事件掉落
        const hasImportantEvent = Math.random() > 0.8;
        if (hasImportantEvent) {
            scenes.push({
                scene: 3,
                content_ids: ["CONTENT12589381890"],
                extra: ""
            });
        }
        
        const responseBody = {
            err_no: 0,
            err_msg: "",
            data: {
                scenes: scenes
            }
        };
        
        const responseData = JSON.stringify(responseBody);
        const responseSignature = getSignature(signatureParams, responseData, secretKey);
        
        ctx.set('content-type', 'application/json');
        ctx.set('x-signature', responseSignature);
        
        ctx.body = responseBody;
        
    } catch (error) {
        ctx.status = 200;
        ctx.body = {
            err_no: 0,
            err_msg: "",
            data: {
                scenes: []
            }
        };
    }
});

app.use(bodyParser());
app.use(router.routes());

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

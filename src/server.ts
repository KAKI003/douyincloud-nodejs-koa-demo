import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from '@koa/router'
import { verifySignature, SignatureParams, getSignature } from './signature';

const app = new Koa();
const router = new Router();
router.get('/', ctx => {
    const now = new Date();
    const currentHour = now.getHours();
    ctx.body = `TEST SUCCESS ${now} ${currentHour}`;
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
        
        const secretKey = 'Tpm12477697026oWa';
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
                
        const now = new Date();
        const currentHour = now.getHours();
        
        // 只有在中午12点之后才添加scenes
        if (currentHour >= 12) {
            scenes.push({
                scene: 2,
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

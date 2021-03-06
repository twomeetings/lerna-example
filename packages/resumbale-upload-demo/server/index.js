import Koa from 'koa'
import Router from 'koa-router'
import fs from 'fs'
import cors from '@koa/cors'
import formidableMiddleware from './formidable-middleware'

const app = new Koa()
const router = new Router()
const uploadDir = './upload/'

if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir)
}

app.use(cors())

app.use(
	formidableMiddleware({
		uploadDir: './upload/',
		hash: true
	})
)

app.use(async (ctx, next) => {
	await next()
	const rt = ctx.response.get('X-Response-Time')
	console.log(`${ctx.method} ${ctx.url} - ${rt}`)
})

app.use(async (ctx, next) => {
	const start = Date.now()
	await next()
	const ms = Date.now() - start
	ctx.set('X-Response-Time', `${ms}ms`)
})

app.on('error', err => {
	console.log('server error:', err)
})

router.get('/', ctx => {
	ctx.body = 'Hello World'
})

router.get('/error', async ctx => {
	ctx.throw(500, 'custome error', { name: 'jacky' })
})

router.post('/post-test', async ctx => {
	console.warn('=== /post-test log :')
	console.log(ctx.query)
	console.log(ctx.request.body)
	console.log(ctx.request.files)
	ctx.body = `post test success! ${JSON.stringify(ctx.request.body)}`
})

router.get('/get-tmp-file-size', async ctx => {
	console.warn(ctx.query)
	const { name } = ctx.query
	const filePath = `./upload/tmp/${name}`
	try {
		const instance = fs.statSync(filePath)
		console.warn(instance)
		ctx.body = { size: instance.size }
	} catch (err) {
		ctx.body = { size: 0 }
	}
})

app.use(router.routes())

app.listen(3000)
console.log('started, please visit http://localhost:3000.')

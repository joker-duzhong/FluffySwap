const { test, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')

// 使用项目已经安装的 TypeScript 编译真实 Store/API，不依赖微信或网络。
const originalResolve = Module._resolveFilename
Module._resolveFilename = function (name, parent, ...rest) {
  return originalResolve.call(this, name.startsWith('@/') ? path.join(__dirname, '../src', name.slice(2)) : name, parent, ...rest)
}
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8')
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  module._compile(output, filename)
}

const storage = new Map()
let requests = []
let respond
let loginCount = 0
const events = []
global.uni = {
  getStorageSync: (key) => storage.get(key),
  setStorageSync: (key, value) => storage.set(key, value),
  removeStorageSync: (key) => storage.delete(key),
  showToast: () => {},
  $emit: (event) => events.push(event),
  login: ({ success }) => queueMicrotask(() => success({ code: `mock-wechat-${++loginCount}` })),
  request: (options) => {
    const request = { url: new URL(options.url).pathname.replace('/api/v1', ''), method: options.method, body: options.data, headers: options.header }
    requests.push(request)
    Promise.resolve().then(() => respond(request)).then((result) => {
      options.success({ statusCode: result.status || 200, data: result.body, header: result.headers || {} })
    }).catch(() => options.fail({ errMsg: 'mock offline' }))
  },
}

const { createPinia, setActivePinia } = require('pinia')
const { useAuthStore } = require('../src/stores/authStore.ts')
const { useInviteStore } = require('../src/stores/inviteStore.ts')
const { useHistoryStore } = require('../src/stores/historyStore.ts')
const { useTaskStore } = require('../src/stores/taskStore.ts')
const { useGalleryStore } = require('../src/stores/galleryStore.ts')
const { aurakeyApi } = require('../src/services/aurakey.ts')
const { configureClient } = require('../src/services/clientConfig.ts')
const { client } = require('../src/services/uniClient.ts')
const { ApiError } = require('../src/services/apiError.ts')
const { STORAGE_KEYS, AUTH_SCOPE } = require('../src/config/index.ts')

const ok = (data) => ({ body: { code: 200, data } })
const fail = (status, message, headers) => ({ status, body: { code: status, message, data: null }, headers })
const user = { id: 'mock-user-a', phone: '13800138000', nickname: '测试用户', avatar: { url: 'https://example.invalid/avatar.png' }, needs_phone_binding: false, roles: [] }
const identity = () => ({ status: 'AUTHENTICATED', access_token: 'mock-access', refresh_token: 'mock-refresh', app_scope: AUTH_SCOPE, user })
const pending = () => ({ status: 'PHONE_REQUIRED', login_ticket: 'mock-ticket-not-a-real-credential', expires_at: new Date(Date.now() + 600000).toISOString() })
const profile = () => ({ user_id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar.url, balance: 37, is_vip: true, type: 'VIP' })
const deferred = () => {
  let resolve
  const promise = new Promise((done) => { resolve = done })
  return { promise, resolve }
}
const tick = () => new Promise((resolve) => setImmediate(resolve))

beforeEach(() => {
  setActivePinia(createPinia())
  storage.clear()
  requests = []
  events.length = 0
  loginCount = 0
  respond = (request) => {
    if (request.url === '/aurakey/user/profile') return ok(profile())
    throw new Error('Unexpected mock route')
  }
  configureClient()
})
afterEach(() => useAuthStore().clearAuth())

test('新身份仅持有内存票据；不会保存 Token 或访问业务 API', async () => {
  respond = () => ok(pending())
  const auth = useAuthStore()
  await Promise.all([auth.startIdentity(), auth.startIdentity()])
  assert.equal(loginCount, 1)
  assert.equal(requests.length, 1)
  assert.equal(requests[0].url, '/auth/identity/miniapp')
  assert.deepEqual(Object.keys(requests[0].body).sort(), ['appid', 'code'])
  assert.equal(requests[0].headers.Authorization, undefined)
  assert.equal(auth.phoneRequired, true)
  assert.equal(auth.isLoggedIn, false)
  assert.equal(auth.token, '')
  assert.equal(storage.size, 0)
})

test('未同意协议时不提交手机证明', async () => {
  respond = () => ok(pending())
  const auth = useAuthStore()
  await auth.startIdentity()
  await assert.rejects(auth.completePhone('mock-phone-code', false), /请先阅读/)
  assert.equal(requests.length, 1)
  assert.equal(auth.phoneRequired, true)
})

test('手机号完成后先绑定邀请，再刷新资料；请求只携带新契约字段', async () => {
  respond = (request) => {
    if (request.url === '/auth/identity/miniapp') return ok(pending())
    if (request.url === '/auth/identity/complete/miniapp-phone') return ok(identity())
    if (request.url === '/aurakey/user/bind-invite') return ok({ is_success: true, reward_points: 50 })
    return ok(profile())
  }
  const auth = useAuthStore()
  useInviteStore().setPendingInviteCode('ABC123')
  await auth.startIdentity()
  await auth.completePhone('mock-phone-code', true)
  assert.equal(auth.isLoggedIn, true)
  assert.equal(auth.loginTicket, '')
  assert.equal(auth.balance, 37)
  assert.equal(auth.isVip, true)
  const completion = requests[1]
  assert.deepEqual(Object.keys(completion.body).sort(), ['accepted_terms', 'login_ticket', 'phone_code'])
  assert.equal(completion.body.accepted_terms, true)
  assert.equal(completion.headers.Authorization, undefined)
  assert.deepEqual(requests.slice(2).map((item) => item.url), ['/aurakey/user/bind-invite', '/aurakey/user/profile'])
  assert.equal(useInviteStore().pendingInviteCode, '')
  assert.equal(JSON.stringify([...storage.values()]).includes('login_ticket'), false)
})

test('已验证身份直接登录；不会再次请求手机号证明', async () => {
  respond = (request) => ok(request.url === '/auth/identity/miniapp' ? identity() : profile())
  await useAuthStore().startIdentity()
  assert.equal(useAuthStore().isLoggedIn, true)
  assert.equal(useAuthStore().phoneRequired, false)
  assert.deepEqual(requests.map((r) => r.url), ['/auth/identity/miniapp', '/aurakey/user/profile'])
})

test('短信保留四位验证码前导零，真实发送请求不含测试参数', async () => {
  respond = (request) => {
    if (request.url === '/auth/identity/miniapp') return ok(pending())
    if (request.url === '/auth/sms/send') return ok(null)
    if (request.url === '/auth/identity/complete/sms') return ok(identity())
    return ok(profile())
  }
  const auth = useAuthStore()
  await auth.startIdentity()
  await aurakeyApi.auth.sendSms('13800138000')
  await auth.completeSms('13800138000', '0123', true)
  assert.deepEqual(requests[1].body, { phone: '13800138000' })
  assert.equal(requests[2].body.code, '0123')
  assert.equal(requests[2].body.accepted_terms, true)
})

test('过期票据不能提交；重启会重新获取微信 code', async () => {
  respond = () => ok(pending())
  const auth = useAuthStore()
  await auth.startIdentity()
  auth.ticketExpiresAt = new Date(Date.now() - 1000).toISOString()
  await assert.rejects(auth.completePhone('mock-phone', true), (error) => error.status === 410)
  await auth.startIdentity()
  assert.equal(loginCount, 2)
  assert.notEqual(requests[0].body.code, requests[1].body.code)
})

test('服务端 410 和 409 清除旧票据并提供明确错误', async () => {
  const auth = useAuthStore()
  for (const status of [410, 409]) {
    respond = (request) => request.url.endsWith('/miniapp') ? ok(pending()) : fail(status, '原始身份错误')
    await auth.startIdentity()
    await assert.rejects(auth.completePhone('mock-phone', true), (error) => error instanceof ApiError && error.status === status && error.message === '原始身份错误')
    assert.equal(auth.loginTicket, '')
    assert.match(auth.identityError, /重新进行微信登录/)
  }
})

test('429 保留票据并遵守 Retry-After；验证码错误可原票据重试', async () => {
  const auth = useAuthStore()
  respond = (request) => request.url.endsWith('/miniapp') ? ok(pending()) : fail(429, '稍后重试', { 'Retry-After': '20' })
  await auth.startIdentity()
  await assert.rejects(auth.completeSms(user.phone, '0123', true), (error) => error.retryAfter === 20)
  const count = requests.length
  await assert.rejects(auth.completeSms(user.phone, '0123', true), (error) => error.status === 429)
  assert.equal(requests.length, count)
  assert.equal(auth.phoneRequired, true)
  auth.retryAt = 0
  respond = () => fail(400, '验证码错误')
  await assert.rejects(auth.completeSms(user.phone, '0123', true), /验证码错误/)
  assert.equal(auth.phoneRequired, true)
})

test('不接受其他业务范围且淘汰旧缓存', async () => {
  storage.set(STORAGE_KEYS.TOKEN, 'mock-old-token')
  storage.set(STORAGE_KEYS.USER_INFO, profile())
  const auth = useAuthStore()
  auth.loadFromStorage()
  assert.equal(auth.isLoggedIn, false)
  assert.equal(storage.size, 0)
  respond = () => ok({ ...identity(), app_scope: 'passport' })
  await assert.rejects(auth.startIdentity(), /不适用于当前小程序/)
  assert.equal(auth.token, '')
})

test('并发 401 只刷新一次，所有请求使用新凭据重放', async () => {
  const auth = useAuthStore()
  await auth.acceptIdentity(identity(), false)
  requests = []
  const gate = deferred()
  respond = async (request) => {
    if (request.url === '/auth/refresh') {
      await gate.promise
      return ok({ access_token: 'mock-new-access', refresh_token: 'mock-new-refresh' })
    }
    return request.headers.Authorization === 'Bearer mock-access' ? fail(401, '已过期') : ok(profile())
  }
  const one = aurakeyApi.user.profile()
  const two = aurakeyApi.user.profile()
  await tick()
  assert.equal(requests.filter((r) => r.url === '/auth/refresh').length, 1)
  gate.resolve()
  await Promise.all([one, two])
  assert.equal(auth.refreshToken, 'mock-new-refresh')
  assert.equal(auth.isLoggedIn, true)
  assert.equal(requests.filter((r) => r.headers.Authorization === 'Bearer mock-new-access').length, 2)
})

test('刷新成功后的 403/400/网络错误不会退出，原错误状态保留', async () => {
  const auth = useAuthStore()
  for (const code of [403, 400, 0]) {
    respond = () => ok(profile())
    await auth.acceptIdentity(identity(), false)
    respond = (request) => {
      if (request.url === '/auth/refresh') return ok({ access_token: 'mock-new-access', refresh_token: 'mock-new-refresh' })
      if (request.headers.Authorization === 'Bearer mock-access') return fail(401, '已过期')
      if (!code) throw new Error('offline')
      return fail(code, '原始业务错误')
    }
    await assert.rejects(aurakeyApi.user.profile(), (error) => error.status === code)
    assert.equal(auth.isLoggedIn, true)
  }
})

test('刷新失败只清理一次会话，不循环重试旧 Refresh Token', async () => {
  const auth = useAuthStore()
  await auth.acceptIdentity(identity(), false)
  requests = []
  respond = () => fail(401, '认证失效')
  await Promise.allSettled([aurakeyApi.user.profile(), aurakeyApi.user.profile()])
  assert.equal(requests.filter((r) => r.url === '/auth/refresh').length, 1)
  assert.equal(auth.isLoggedIn, false)
  assert.equal(events.filter((event) => event === 'auth:login-required').length, 1)
})

test('退出清空作品/草稿，旧响应不能覆盖后来登录的用户', async () => {
  const auth = useAuthStore()
  await auth.acceptIdentity(identity(), false)
  const history = useHistoryStore()
  history.items = [{ task_id: 'old-work', status: 'success' }]
  useGalleryStore().selectedItem = { id: 'old-selected-template' }
  useGalleryStore().total = 4
  useTaskStore().prompt = '旧账户草稿'
  const gate = deferred()
  respond = () => gate.promise
  const oldRequest = auth.refreshProfile()
  await tick()
  auth.clearAuth()
  assert.equal(history.items.length, 0)
  assert.equal(useGalleryStore().selectedItem, null)
  assert.equal(useGalleryStore().total, 0)
  assert.equal(useTaskStore().prompt, '')
  respond = () => ok({ ...profile(), user_id: 'mock-user-b' })
  await auth.acceptIdentity({ ...identity(), user: { ...user, id: 'mock-user-b' } }, false)
  gate.resolve(ok(profile()))
  await assert.rejects(oldRequest, (error) => error.status === 499)
  assert.equal(auth.userProfile.user_id, 'mock-user-b')
})

test('退出后新会话的刷新不共用旧会话仍在进行的请求', async () => {
  const auth = useAuthStore()
  await auth.acceptIdentity(identity(), false)
  const oldGate = deferred()
  respond = () => oldGate.promise
  const oldRefresh = auth.refreshSession()
  await tick()
  auth.clearAuth()
  respond = (request) => request.url === '/auth/refresh'
    ? ok({ access_token: 'mock-next-access', refresh_token: 'mock-next-refresh' })
    : ok(profile())
  await auth.acceptIdentity(identity(), false)
  await auth.refreshSession()
  oldGate.resolve(ok({ access_token: 'mock-stale-access', refresh_token: 'mock-stale-refresh' }))
  await assert.rejects(oldRefresh, (error) => error.status === 499)
  assert.equal(auth.token, 'mock-next-access')
  assert.equal(auth.isLoggedIn, true)
})

test('资料更新提取头像 URL，保留余额会员；下单不依赖 OpenID', async () => {
  const auth = useAuthStore()
  await auth.acceptIdentity(identity(), false)
  auth.updatePlatformUser({ ...user, avatar: { url: 'https://example.invalid/new.png' } })
  assert.equal(auth.userProfile.avatar, 'https://example.invalid/new.png')
  assert.equal(auth.balance, 37)
  assert.equal(auth.isVip, true)
  respond = () => ok({ order_no: 'mock-order', pay_params: {} })
  await aurakeyApi.order.create('mock-product')
  assert.deepEqual(requests.at(-1).body, { product_id: 'mock-product' })
})

test('所有草稿入口限制一张参考图', () => {
  const task = useTaskStore()
  task.setReferenceImages([{ id: 'first' }, { id: 'second' }])
  assert.equal(task.referenceImages.length, 1)
  task.applyPreset('mock', undefined, undefined, [{ id: 'new-first' }, { id: 'new-second' }])
  assert.deepEqual(task.referenceImages.map((r) => r.id), ['new-first'])
})

test('业务错误包装保留 status/message，不能捕获为被拒绝的 Promise', async () => {
  respond = () => fail(403, '该业务禁止访问')
  await assert.rejects(client.GET('/aurakey/mock'), (error) => error instanceof ApiError && error.status === 403 && error.message === '该业务禁止访问')
})

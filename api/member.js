import request from '@/utils/requestUtil'

// 1. 会员登录
export function memberLogin(data) {
	return request({
		method: 'POST',
		url: '/sso/login',
		header: {
			'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
		},
		data: data
	})
}

// 2. 获取会员信息
export function memberInfo() {
	return request({
		method: 'GET',
		url: '/sso/info'
	})
}

// 3. 获取验证码 (新增)
// 根据Swagger，这是GET请求，通常需要传 telephone 参数
export function getAuthCode(telephone) {
	return request({
		method: 'GET',
		url: '/sso/getAuthCode',
		params: { telephone }
	})
}

// 4. 会员注册 (新增)
// 对应 Swagger 的 POST /sso/register
export function memberRegister(data) {
	return request({
		method: 'POST',
		url: '/sso/register',
		data: data
	})
}

// 5. 修改密码 (新增)
// 对应 Swagger 的 POST /sso/updatePassword
export function updatePassword(data) {
	return request({
		method: 'POST',
		url: '/sso/updatePassword',
		data: data
	})
}
import request from '@/utils/requestUtil'

// 1. 会员登录
// 后端使用 @RequestParam 接收，必须指定表单格式
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
// 通常需要带 Token，requestUtil 应该已经统一处理了 header 中的 Authorization
export function memberInfo() {
    return request({
       method: 'GET',
       url: '/sso/info'
    })
}

// 3. 获取验证码
// Swagger 显示为 GET 请求，参数 telephone 通过查询字符串(params)传递
export function getAuthCode(telephone) {
    return request({
       method: 'GET',
       url: '/sso/getAuthCode',
       params: { telephone }
    })
}

// 4. 会员注册
// 修正：增加表单 header，解决 MissingServletRequestParameterException 报错
export function memberRegister(data) {
    return request({
       method: 'POST',
       url: '/sso/register',
       header: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
       },
       data: data
    })
}

// 5. 修改密码
// 修正：同样需要表单格式，对应后端 /sso/updatePassword
export function updatePassword(data) {
    return request({
       method: 'POST',
       url: '/sso/updatePassword',
       header: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
       },
       data: data
    })
}
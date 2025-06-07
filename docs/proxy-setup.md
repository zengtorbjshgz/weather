# 代理服务器配置说明

## 概述

为了解决前端直接调用百度天气API时遇到的跨域问题，我们在Vite开发服务器中配置了代理服务器。代理服务器将前端的API请求转发到百度天气API，从而避免浏览器的同源策略限制。

## 配置详情

### Vite代理配置

在 `vite.config.ts` 文件中添加了以下代理配置：

```typescript
server: {
  proxy: {
    // 代理百度天气API请求
    '/api/weather': {
      target: 'https://api.map.baidu.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/weather/, '/weather/v1'),
      secure: true,
      configure: (proxy, options) => {
        proxy.on('error', (err, req, res) => {
          console.log('代理错误:', err)
        })
        proxy.on('proxyReq', (proxyReq, req, res) => {
          console.log('代理请求:', req.method, req.url)
        })
        proxy.on('proxyRes', (proxyRes, req, res) => {
          console.log('代理响应:', proxyRes.statusCode, req.url)
        })
      }
    }
  }
}
```

### 配置说明

- **target**: `https://api.map.baidu.com` - 目标服务器地址
- **changeOrigin**: `true` - 修改请求头中的Origin字段
- **rewrite**: 路径重写，将 `/api/weather` 重写为 `/weather/v1`
- **secure**: `true` - 支持HTTPS目标服务器
- **configure**: 添加日志记录，便于调试

## 前端调用方式

### 修改前（直接调用，存在跨域问题）

```javascript
const url = `https://api.map.baidu.com/weather/v1/`
```

### 修改后（通过代理调用）

```javascript
const url = `/api/weather/`
```

## 请求流程

1. 前端发起请求：`GET /api/weather/?district_id=110101&data_type=all&ak=YOUR_API_KEY`
2. Vite代理服务器接收请求
3. 代理服务器将请求转发到：`https://api.map.baidu.com/weather/v1/?district_id=110101&data_type=all&ak=YOUR_API_KEY`
4. 百度API返回响应
5. 代理服务器将响应转发给前端

## 优势

1. **解决跨域问题**: 避免浏览器同源策略限制
2. **开发便利**: 无需额外配置CORS
3. **调试友好**: 提供详细的代理日志
4. **安全性**: API密钥仍然通过环境变量管理

## 注意事项

1. **仅开发环境**: 此代理配置仅在开发环境（`npm run dev`）中生效
2. **生产环境**: 生产环境需要在服务器端配置相应的代理或使用服务端API
3. **API密钥**: 确保在 `.env` 文件中正确配置 `VITE_BAIDU_AK`
4. **网络要求**: 开发服务器需要能够访问百度API服务器

## 调试信息

代理配置包含了详细的日志记录，在浏览器开发者工具的控制台中可以看到：

- 代理请求日志
- 代理响应状态
- 错误信息（如果有）

## 故障排除

### 常见问题

1. **代理请求失败**
   - 检查网络连接
   - 确认API密钥是否正确
   - 查看控制台错误信息

2. **API返回错误**
   - 检查district_id参数是否正确
   - 确认API密钥权限
   - 查看百度API文档

3. **开发服务器启动失败**
   - 检查vite.config.ts语法
   - 确认端口是否被占用
   - 重新安装依赖

### 调试步骤

1. 打开浏览器开发者工具
2. 切换到Network标签页
3. 刷新页面或触发天气数据获取
4. 查看 `/api/weather/` 请求的状态和响应
5. 检查控制台日志信息

## 相关文件

- `vite.config.ts` - 代理配置
- `src/components/WeatherDisplay.vue` - API调用实现
- `.env` - 环境变量配置
- `docs/api-setup.md` - API配置说明
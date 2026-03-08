# 蓝莓后管系统

这是一个用于处理蓝莓订单的后台管理系统。
选用技术栈：Vue 3 + Vite + Element Plus + Express + MySQL。

## 目录结构
- `/frontend` - Vue 3 前端项目
- `/backend` - Express 后端项目

## 快速开始

### 1. 数据库配置
1. 确保已安装并运行 MySQL。
2. 创建目标数据库并初始化表结构。
   可以直接运行下面脚本或者连接 MySQL 后执行 `backend/db/init.sql` 中的内容：
   ```bash
   sqlite3 或 mysql 命令导入
   ```
3. 在 `backend/.env` 文件中配置您的数据库连接信息：
   ```env
   PORT=3100
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=root
   DB_NAME=blueberry_admin
   ```

### 2. 启动服务端
进入 `backend` 目录，安装依赖并启动服务：
```bash
cd backend
npm install
npm run dev
```
此时后端 API 将在 `http://localhost:3100` 上运行。

### 3. 启动前端页面
另起一个终端面板，进入 `frontend` 目录：
```bash
cd frontend
npm install
npm run dev
```
按照控制台输出的地址即可访问（例如 `http://localhost:5173`）。

### 服务说明
1. 前端包含 Vue Router 进行单页路由和 Element Plus 提供的常用 UI 组件。主要页面在 `frontend/src/views/order/index.vue`。
2. 请求封装在 `frontend/src/utils/request.ts`。
3. 后端提供标准的 RESTful 接口用于订单的增删改查支持，统一返回 `code: 200` 格式方便拦截器判断。

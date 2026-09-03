# 📋 客户/供应商信息采集系统

一个基于 Node.js + MongoDB 的轻量级移动端数据采集系统，专为业务员外出跑市场时记录客户/供应商信息而设计。支持按天分组、数据导出和批量删除，帮助企业高效收集和管理一线业务数据。

---

## 🎯 项目背景

业务员经常需要在外跑市场，记录的客户信息通常散落在微信群中，难以统一收集和管理。本项目提供了一个**手机端填写 + 云端存储 + 后台管理**的一站式解决方案：

- **业务员**：通过手机浏览器填写客户/供应商信息，数据实时上传至云端。
- **管理者**：周一上班时登录后台，按天查看所有新增数据，支持导出 Excel 和批量删除。

---

## ✨ 核心功能

| 功能模块 | 说明 |
|---------|------|
| 📱 **移动端填表** | 业务员通过手机浏览器填写信息，支持选择“客户”或“供应商”，证件号自动切换（信用代码/身份证号） |
| 🏢 **多公司分配** | 支持将客户分配给多个公司（兴平面粉、富平面粉、工业公司、米业公司、黑龙江米业） |
| 📊 **按天分组后台** | 数据按提交日期自动分组，最新记录排在最前面 |
| 🔐 **登录保护** | 后台页面受密码保护，防止无关人员查看敏感数据 |
| 📥 **Excel 导出** | 支持勾选多条数据，一键导出为 Excel 文件（含表头） |
| 🗑️ **批量删除** | 支持全选后批量删除，防止云存储空间被占满 |
| ☁️ **云端部署** | 部署在 Render + MongoDB Atlas，电脑关机也能正常使用 |

---

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| **Node.js + Express** | 后端服务框架 |
| **MongoDB Atlas** | 云端数据库（免费 512MB） |
| **Render** | 云服务器托管（免费 750 小时/月） |
| **express-basic-auth** | 后台页面登录认证 |
| **SheetJS (xlsx)** | Excel 文件生成 |
| **Mongoose** | MongoDB ORM 框架 |
| **GitHub** | 代码版本管理与自动部署 |

---

## 📁 项目结构

```
customer-api/
├── server.js              # 后端主程序（API 接口 + 认证中间件）
├── client.html            # 移动端填表页面（公开访问）
├── dashboard.html         # 后台管理页面（需登录）
├── package.json           # 项目依赖配置
├── package-lock.json      # 依赖版本锁定
└── README.md              # 项目说明文档（本文件）
```

---

## 🚀 快速开始（部署指南）

### 前提条件

- 一个 **GitHub** 账号（免费）
- 一个 **MongoDB Atlas** 账号（免费）
- 一个 **Render** 账号（免费，用 GitHub 登录）

### 第一步：注册 MongoDB Atlas（云数据库）

1. 打开 https://www.mongodb.com/cloud/atlas，点击 **"Try Free"** 注册。
2. 创建集群（Cluster）：
   - 选择 **"Shared Clusters"**（免费），点击 **"Create a Cluster"**。
   - 云服务商选 **AWS**，区域选 **"Singapore"**（国内访问较快）。
   - 点击 **"Create Cluster"**，等待 1-3 分钟。
3. 创建数据库用户：
   - 左侧菜单 **"Database Access"** → **"Add New Database User"**
   - 用户名：`admin`，密码：自行设置（**记下来！**）
   - 权限选 **"Read and write to any database"**
4. 配置网络访问（IP 白名单）：
   - 左侧菜单 **"Network Access"** → **"Add IP Address"**
   - 点击 **"Allow Access from Anywhere"**（输入 `0.0.0.0/0`）
5. 获取连接字符串：
   - 点击 **"Connect"** → **"Connect your application"**
   - 复制连接字符串，格式如下：
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - **将 `<password>` 替换成你设置的真实密码**，保存到记事本备用。

### 第二步：准备代码并上传到 GitHub

1. 下载本项目所有文件（`server.js`、`client.html`、`dashboard.html`、`package.json`）。
2. 登录 GitHub，点击右上角 **"+"** → **"New repository"**，仓库名填 `customer-api`。
3. 在新建仓库页面，点击 **"Upload files"**，将上述 4 个文件拖入上传区域，点击 **"Commit changes"** 提交。

### 第三步：在 Render 部署

1. 打开 https://render.com，用 **GitHub 账号**登录。
2. 点击 **"New +"** → **"Web Service"**。
3. 连接 GitHub，找到仓库 `customer-api`，点击 **"Connect"**。
4. 填写配置：

| 配置项 | 填写内容 |
|--------|----------|
| Name | `my-customer-api`（可自定义） |
| Environment | `Node` |
| Build Command | `npm install` |
| Start Command | `node server.js` |

5. **添加环境变量**（点击 "Add Environment Variable"）：

| KEY | VALUE |
|-----|-------|
| `MONGO_URI` | 第一步保存的 MongoDB 连接字符串（密码已替换） |
| `BASIC_AUTH_USERNAME` | 后台登录用户名（如 `admin`） |
| `BASIC_AUTH_PASSWORD` | 后台登录密码（如 `yourpassword`） |

6. 点击 **"Create Web Service"**，等待 2-3 分钟部署完成，状态变为绿色 **`Live`**。

### 第四步：获取访问地址

部署成功后，Render 会分配一个公网地址，格式为：
```
https://my-customer-api.onrender.com
```

- **业务员填表**：`https://你的地址/client.html`
- **后台管理**：`https://你的地址/dashboard.html`（需输入用户名/密码）

---

## 🔧 环境变量配置说明

在 Render 的 **Environment** 设置中，需要配置以下环境变量：

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `MONGO_URI` | ✅ | MongoDB 连接字符串（含真实密码） |
| `BASIC_AUTH_USERNAME` | ✅ | 后台登录用户名 |
| `BASIC_AUTH_PASSWORD` | ✅ | 后台登录密码 |

> ⚠️ **注意**：`MONGO_URI` 中的 `<password>` 必须替换为你的真实数据库密码，否则无法连接数据库。

---

## 📡 API 接口文档

所有接口基地址：`https://你的地址/api`

| 方法 | 路径 | 功能 | 权限 |
|------|------|------|------|
| POST | `/customers` | 新增客户/供应商 | 公开 |
| GET | `/customers` | 查询所有数据 | 公开（页面已受登录保护） |
| DELETE | `/customers/:id` | 删除单条数据 | 公开（页面已受登录保护） |

### 请求示例（POST）

```json
{
  "entryType": "客户",
  "companyName": "XX科技有限公司",
  "idNumber": "91440101MA5XXXXXX",
  "contactName": "张三",
  "contactPhone": "13800138000",
  "salesman": "李四",
  "assignedCompanies": ["兴平面粉", "米业公司"]
}
```

### 响应格式

```json
{
  "code": 0,
  "message": "信息提交成功！",
  "data": { ... }
}
```

错误响应示例：
```json
{
  "code": 400,
  "message": "公司名称不能为空"
}
```

---

## 📱 使用场景

### 业务员（手机端）
1. 打开链接：`https://你的地址/client.html`
2. 选择类型（客户/供应商），填写信息，至少勾选一个分配公司
3. 点击提交，数据实时存入云数据库

### 管理员（周一查看）
1. 打开链接：`https://你的地址/dashboard.html`
2. 输入用户名和密码登录
3. 查看按天分组的数据，导出 Excel 或批量删除

---

## 🖼️ 截图预览

### 手机端填表页面
（client.html）
- 顶部标题：“客户/供应商信息上报”
- 类型选择：客户/供应商（单选切换）
- 公司名称、证件号（根据类型自动切换输入框）、客户姓名、电话、业务员、分配公司（复选框）
- 提交按钮

### 后台管理页面
（dashboard.html）
- 顶部：标题 + 数据总数
- 工具栏：刷新、导出选中到 Excel、删除选中、全选
- 主体：按天分组显示（如“2026年9月3日”分组），每条记录显示：类型标签（客户/供应商）、公司名称、证件号、联系人、电话、业务员、分配公司、提交时间、删除按钮

---

## ⚠️ 注意事项

1. **免费额度限制**：
   - Render 免费服务 15 分钟无访问会自动休眠，下次访问需等待 20-30 秒唤醒。
   - MongoDB Atlas 免费版提供 512MB 存储，约可存储 50 万条客户记录。

2. **安全性提醒**：
   - 建议设置强密码（至少 8 位，包含大小写字母+数字）。
   - 定期备份数据库（可在 MongoDB Atlas 控制台导出）。
   - 如果数据量增大，建议将 API 接口也加上认证保护。

3. **维护建议**：
   - 定期登录后台清理过期数据，释放存储空间。
   - 如需修改业务逻辑（如增加新的分配公司），直接修改 `client.html` 中的复选框列表即可。

---

## 🔄 后续扩展建议

- 增加数据统计图表（如各公司客户数量分布）
- 支持按日期范围筛选导出
- 增加短信/邮件通知功能（有新数据提交时提醒）
- 增加数据导入功能（从 Excel 批量导入）

---

## 📄 License

MIT License

---

## 🙏 致谢

感谢使用本项目！如果在部署过程中遇到任何问题，欢迎提交 Issue 或直接联系项目维护者。

---

**祝您的业务数据管理更高效！** 🚀

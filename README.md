# 📋 客户/供应商信息采集系统

基于 Node.js + MongoDB 的移动端数据采集平台，专为业务人员外出市场调研时记录客户/供应商信息而设计。支持多维度分类、按天分组、Excel 导出和批量删除，帮助团队高效归集一线业务数据。

---

## 🎯 项目背景

业务人员通过微信群散乱地发送客户信息，导致数据丢失、重复、难以汇总。本系统提供**手机端快速填报 + 云端持久化存储 + 后台统一管理**的闭环方案：

- **业务员**：通过手机浏览器填写客户/供应商信息，区分企业/个人，数据实时上传。
- **管理者**：周一登录后台，按天查看所有新增数据，支持导出 Excel 和批量删除，轻松录入公司系统。

---

## ✨ 核心功能

| 模块 | 功能说明 |
|------|----------|
| 📱 **移动端填表** | 业务员选择“客户/供应商”，再选择“企业/个人”，自动切换证件号输入（统一社会信用代码 / 身份证号），支持多公司分配。 |
| 🏢 **多公司分配** | 可将客户/供应商分配给一个或多个内部公司（兴平面粉、富平面粉、工业公司、米业公司、黑龙江米业）。 |
| 📊 **后台数据看板** | 按提交日期自动分组，最新记录置顶。每条记录清晰展示业务类型、主体类型、证件号等全部字段。 |
| 🔐 **登录保护** | 后台页面受密码保护，防止未授权访问。 |
| 📥 **Excel 导出** | 勾选所需数据，一键导出为 `.xlsx` 文件，包含所有字段的表头。 |
| 🗑️ **批量删除** | 全选或勾选多条数据，一键批量删除，便于清理过期数据，节约云存储空间。 |
| ☁️ **云端部署** | 部署在 Render + MongoDB Atlas，电脑关机服务依然在线，数据永久保存。 |

---

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| **Node.js + Express** | 后端 RESTful API 服务 |
| **MongoDB Atlas** | 云端 NoSQL 数据库（免费 512MB） |
| **Render** | 云应用托管（免费 750 小时/月） |
| **express-basic-auth** | 后台 HTTP 基本认证 |
| **SheetJS (xlsx)** | Excel 文件生成 |
| **Mongoose** | MongoDB ODM 数据建模 |
| **GitHub** | 代码仓库 + 自动部署触发 |

---

## 📁 项目结构

```
customer-api/
├── server.js              # 主程序（API + 认证 + 静态托管）
├── client.html            # 移动端填表页面（公开）
├── dashboard.html         # 后台管理页面（需登录）
├── package.json           # 依赖声明
├── package-lock.json      # 依赖锁定
└── README.md              # 项目说明
```

---

## 🚀 部署指南（从零开始）

### 前置条件
- GitHub 账号（免费）
- MongoDB Atlas 账号（免费）
- Render 账号（推荐用 GitHub 登录，免费）

---

### 1. 创建 MongoDB Atlas 数据库

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)，点击 **Try Free** 注册登录。
2. 创建集群（Cluster）：
   - 选择 **Shared Clusters**（免费版），点击 **Create a Cluster**。
   - 云厂商选 **AWS**，区域选 **Singapore**（亚太延迟低）或 **Oregon**（美国）。
   - 点击创建，等待 1~3 分钟。
3. 创建数据库用户：
   - 左侧菜单 **Database Access** → **Add New Database User**。
   - 用户名：`admin`（可自定义），密码自行设置（**务必记下**）。
   - 权限：**Read and write to any database**。
4. 配置 IP 白名单：
   - 左侧菜单 **Network Access** → **Add IP Address**。
   - 点击 **Allow Access from Anywhere**（`0.0.0.0/0`），确认。
5. 获取连接字符串：
   - 点击集群 **Connect** → **Connect your application**。
   - 复制连接字符串，格式如：
     ```
     mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - 将 `<password>` 替换为你的数据库用户密码，保存备用。

---

### 2. 准备代码并上传至 GitHub

1. 从本仓库或发布包中获取以下文件：
   - `server.js`
   - `client.html`
   - `dashboard.html`
   - `package.json`
2. 登录 GitHub，点击右上角 **+** → **New repository**，名称如 `customer-api`。
3. 在新建仓库页面，点击 **Upload files**，将上述 4 个文件拖入上传区域，然后点击 **Commit changes** 提交。

---

### 3. 在 Render 部署服务

1. 访问 [Render](https://render.com)，使用 GitHub 账号登录。
2. 点击 **New +** → **Web Service**。
3. 连接 GitHub，找到仓库 `customer-api`，点击 **Connect**。
4. 填写服务配置：

| 配置项 | 填写内容 |
|--------|----------|
| Name | 自定义（如 `my-customer-api`） |
| Environment | `Node` |
| Build Command | `npm install` |
| Start Command | `node server.js` |

5. **添加环境变量（关键）**：
   - 点击 **Add Environment Variable**，添加以下三项：

| KEY | VALUE |
|-----|-------|
| `MONGO_URI` | 第1步获得的 MongoDB 连接字符串（已替换真实密码） |
| `BASIC_AUTH_USERNAME` | 后台登录用户名（如 `admin`） |
| `BASIC_AUTH_PASSWORD` | 后台登录密码（如 `YourStrongP@ssw0rd`） |

6. 点击 **Create Web Service**，等待 2~3 分钟部署完成，状态变为绿色 **Live**。

---

### 4. 获取访问地址

部署成功后，Render 会分配一个公网域名，格式：  
`https://my-customer-api.onrender.com`

- **业务员填表入口**：`https://你的域名/client.html`（无需登录）
- **后台管理入口**：`https://你的域名/dashboard.html`（需要输入用户名/密码）

---

## 📡 API 接口文档

所有接口基地址：`https://你的域名/api`

| 方法 | 路径 | 功能 | 权限 |
|------|------|------|------|
| POST | `/customers` | 新增客户/供应商记录 | 公开 |
| GET | `/customers` | 获取所有记录（按时间倒序） | 公开（页面受登录保护） |
| DELETE | `/customers/:id` | 删除单条记录 | 公开（页面受登录保护） |

### POST 请求体示例

```json
{
  "entryType": "客户",          // 枚举: "客户" 或 "供应商"
  "entityType": "企业",         // 枚举: "企业" 或 "个人"
  "companyName": "XX科技有限公司",
  "idNumber": "91440101MA5XXXXXX", // 企业填信用代码，个人填身份证号
  "contactName": "张三",
  "contactPhone": "13800138000",
  "salesman": "李四",
  "assignedCompanies": ["兴平面粉", "米业公司"]  // 可多选
}
```

### 响应格式

成功：
```json
{
  "code": 0,
  "message": "信息提交成功！",
  "data": { ... }
}
```

失败：
```json
{
  "code": 400,
  "message": "公司名称不能为空"
}
```

---

## 🖥️ 使用指南

### 业务员（手机端）
1. 用手机浏览器打开填表链接（可收藏或分享到微信群）。
2. 依次选择：
   - **业务类型**：客户 / 供应商
   - **主体类型**：企业 / 个人（证件号输入框会联动切换）
3. 填写名称、证件号、联系人、电话、业务员姓名。
4. 勾选至少一个分配公司，点击提交。
5. 提交成功后，数据实时存入云数据库。

### 管理员（周一汇总）
1. 在电脑或手机浏览器打开后台链接，输入用户名和密码登录。
2. 查看按天分组的数据，最新记录排在最前面。
3. **导出 Excel**：勾选所需数据（可全选），点击“导出选中到 Excel”自动下载。
4. **批量删除**：勾选数据，点击“删除选中”清理过期记录（防止存储空间不足）。
5. 单条记录也可通过右侧“删除”按钮移除。

---

## 🔧 环境变量说明

在 Render 的 **Environment** 设置中，需要配置以下环境变量：

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `MONGO_URI` | ✅ | MongoDB 连接字符串（含真实密码） |
| `BASIC_AUTH_USERNAME` | ✅ | 后台登录用户名 |
| `BASIC_AUTH_PASSWORD` | ✅ | 后台登录密码 |

> ⚠️ 请确保 `MONGO_URI` 中的 `<password>` 已替换为您的真实数据库密码，否则服务无法连接数据库。

---

## ⚠️ 注意事项

1. **免费额度限制**：
   - Render 免费服务若 15 分钟无访问会自动休眠，再次访问需等待 20~30 秒唤醒，不影响正常使用。
   - MongoDB Atlas 免费版提供 512MB 存储空间，约可存储 50 万条记录，满足中小企业需求。

2. **安全性建议**：
   - 使用强密码（大小写+数字+特殊字符），并定期更换。
   - 建议定期登录 MongoDB Atlas 导出数据备份。
   - 如需更高安全级别，可考虑为 API 也增加认证中间件。

3. **维护建议**：
   - 定期清理历史数据（建议每月清理一次），保持数据库轻量。
   - 如需增加新的分配公司，可直接修改 `client.html` 和 `dashboard.html` 中的复选框列表。

---

## 🔄 后续扩展建议

- 增加数据统计图表（如各公司客户数趋势）
- 支持按日期范围筛选导出
- 接入企业微信/钉钉机器人，新数据提交时自动通知
- 开发微信小程序版，提升移动端使用体验
- 增加数据导入功能（从 Excel 批量导入存量客户）

---

## 📄 License

MIT License

---

## 🙏 致谢

感谢使用本系统！如果在部署过程中遇到任何问题，欢迎联系维护者。  
**祝您的业务数据管理更高效、更智能！** 🚀

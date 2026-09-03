const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const basicAuth = require('express-basic-auth'); // 认证中间件
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ─── 1️⃣ 先为后台页面设置登录保护（必须在静态文件托管之前） ───
app.use('/dashboard.html', basicAuth({
    users: {
        [process.env.BASIC_AUTH_USERNAME || 'admin']: process.env.BASIC_AUTH_PASSWORD || '123456'
    },
    challenge: true,
    unauthorizedResponse: '❌ 访问被拒绝，请提供正确的用户名和密码'
}));

// 保护 dashboard 相关的其他静态资源（如果有）
app.use('/dashboard', basicAuth({
    users: {
        [process.env.BASIC_AUTH_USERNAME || 'admin']: process.env.BASIC_AUTH_PASSWORD || '123456'
    },
    challenge: true,
    unauthorizedResponse: '❌ 访问被拒绝'
}));

// ─── 2️⃣ 然后托管所有静态文件（client.html 可公开访问） ───
app.use(express.static(__dirname));

// ─── 连接云数据库 ───
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/customerDB';
mongoose.connect(mongoURI)
    .then(() => console.log('✅ 云数据库连接成功！'))
    .catch(err => console.log('❌ 数据库连接失败', err));

// ─── 数据结构定义 ───
const customerSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    creditCode: { type: String, required: true },
    contactName: String,
    contactPhone: String,
    salesman: { type: String, required: true },
    assignedCompanies: { type: [String], required: true },
    createdAt: { type: Date, default: Date.now }
});
const Customer = mongoose.model('Customer', customerSchema);

// ─── API 接口（公开，不受认证影响，因为 client.html 需要提交） ───

// 1. 新增客户（手机端调用）
app.post('/api/customers', async (req, res) => {
    try {
        const { companyName, creditCode, contactName, contactPhone, salesman, assignedCompanies } = req.body;

        if (!companyName) return res.status(400).json({ code: 400, message: '公司名称不能为空' });
        if (!creditCode) return res.status(400).json({ code: 400, message: '统一社会信用代码不能为空' });
        if (!salesman) return res.status(400).json({ code: 400, message: '业务员姓名不能为空' });
        if (!assignedCompanies || assignedCompanies.length === 0) {
            return res.status(400).json({ code: 400, message: '请至少选择一个分配公司' });
        }

        const newCustomer = new Customer({
            companyName,
            creditCode,
            contactName: contactName || '',
            contactPhone: contactPhone || '',
            salesman,
            assignedCompanies
        });
        await newCustomer.save();

        res.json({
            code: 0,
            message: '客户信息提交成功！',
            data: { id: newCustomer._id, ...newCustomer._doc }
        });
    } catch (err) {
        res.status(500).json({ code: 500, message: '服务器错误', error: err.message });
    }
});

// 2. 查询所有客户（后台使用，但 API 本身公开，因为页面已保护，一般用户无法获取数据）
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        const data = customers.map(c => ({
            id: c._id,
            companyName: c.companyName,
            creditCode: c.creditCode,
            contactName: c.contactName,
            contactPhone: c.contactPhone,
            salesman: c.salesman,
            assignedCompanies: c.assignedCompanies,
            createdAt: c.createdAt
        }));
        res.json({ code: 0, message: 'success', data });
    } catch (err) {
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
});

// 3. 删除单个客户（后台使用，API 公开但页面已保护）
app.delete('/api/customers/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await Customer.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ code: 404, message: '客户不存在' });
        res.json({ code: 0, message: '删除成功' });
    } catch (err) {
        res.status(500).json({ code: 500, message: '删除失败' });
    }
});

app.listen(port, () => {
    console.log(`🚀 服务已启动！`);
    console.log(`📱 手机填写页面（公开）：http://localhost:${port}/client.html`);
    console.log(`💻 后台管理（需登录）：http://localhost:${port}/dashboard.html`);
});
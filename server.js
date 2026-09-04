const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const basicAuth = require('express-basic-auth');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ─── 1. 先为后台页面设置登录保护 ───
app.use('/dashboard.html', basicAuth({
    users: {
        [process.env.BASIC_AUTH_USERNAME || 'admin']: process.env.BASIC_AUTH_PASSWORD || '123456'
    },
    challenge: true,
    unauthorizedResponse: '❌ 访问被拒绝，请提供正确的用户名和密码'
}));

app.use('/dashboard', basicAuth({
    users: {
        [process.env.BASIC_AUTH_USERNAME || 'admin']: process.env.BASIC_AUTH_PASSWORD || '123456'
    },
    challenge: true,
    unauthorizedResponse: '❌ 访问被拒绝'
}));

// ─── 2. 然后托管所有静态文件 ───
app.use(express.static(__dirname));

// ─── 连接云数据库 ───
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/customerDB';
mongoose.connect(mongoURI)
    .then(() => console.log('✅ 云数据库连接成功！'))
    .catch(err => console.log('❌ 数据库连接失败', err));

// ─── 数据结构定义（新增 entityType） ───
const customerSchema = new mongoose.Schema({
    entryType: { 
        type: String, 
        required: true, 
        enum: ['客户', '供应商']
    },
    entityType: { 
        type: String, 
        required: true, 
        enum: ['企业', '个人']  // ⭐ 新增：主体类型
    },
    companyName: { type: String, required: true },
    idNumber: { type: String, required: true },  // 统一存储：信用代码或身份证号
    contactName: String,
    contactPhone: String,
    salesman: { type: String, required: true },
    assignedCompanies: { type: [String], required: true },
    createdAt: { type: Date, default: Date.now }
});
const Customer = mongoose.model('Customer', customerSchema);

// ─── API 接口 ───

app.post('/api/customers', async (req, res) => {
    try {
        const { entryType, entityType, companyName, idNumber, contactName, contactPhone, salesman, assignedCompanies } = req.body;

        if (!entryType) return res.status(400).json({ code: 400, message: '请选择业务类型（客户/供应商）' });
        if (!entityType) return res.status(400).json({ code: 400, message: '请选择主体类型（企业/个人）' });
        if (!companyName) return res.status(400).json({ code: 400, message: '名称不能为空' });
        if (!idNumber) return res.status(400).json({ code: 400, message: '证件号不能为空' });
        if (!salesman) return res.status(400).json({ code: 400, message: '业务员姓名不能为空' });
        if (!assignedCompanies || assignedCompanies.length === 0) {
            return res.status(400).json({ code: 400, message: '请至少选择一个分配公司' });
        }

        const newCustomer = new Customer({
            entryType,
            entityType,
            companyName,
            idNumber,
            contactName: contactName || '',
            contactPhone: contactPhone || '',
            salesman,
            assignedCompanies
        });
        await newCustomer.save();

        res.json({
            code: 0,
            message: '信息提交成功！',
            data: { id: newCustomer._id, ...newCustomer._doc }
        });
    } catch (err) {
        res.status(500).json({ code: 500, message: '服务器错误', error: err.message });
    }
});

app.get('/api/customers', async (req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        const data = customers.map(c => ({
            id: c._id,
            entryType: c.entryType,
            entityType: c.entityType,
            companyName: c.companyName,
            idNumber: c.idNumber,
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

app.delete('/api/customers/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await Customer.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ code: 404, message: '数据不存在' });
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
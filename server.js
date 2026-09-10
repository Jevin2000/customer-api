const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const basicAuth = require('express-basic-auth');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ─── 1. 先为后台页面设置登录保护（必须在静态文件托管之前） ───
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

// ─── 2. 然后托管所有静态文件（client.html 可公开访问） ───
app.use(express.static(__dirname));

// ─── 连接云数据库 ───
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/customerDB';
mongoose.connect(mongoURI)
    .then(() => console.log('✅ 云数据库连接成功！'))
    .catch(err => console.log('❌ 数据库连接失败', err));

// ─── 数据结构定义 ───
const customerSchema = new mongoose.Schema({
    entryType: {
        type: String,
        required: true,
        enum: ['客户', '供应商']
    },
    entityType: {
        type: String,
        required: true,
        enum: ['企业', '个人']
    },
    companyName: { type: String, required: true },
    idNumber: { type: String, required: true },
    contactName: String,
    contactPhone: String,
    salesman: { type: String, required: true },
    assignedCompanies: { type: [String], required: true },
    createdAt: { type: Date, default: Date.now }
});
const Customer = mongoose.model('Customer', customerSchema);

// ─── API 接口 ───

// 1. 新增客户/供应商
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

// 2. 查询所有数据
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

// 3. 删除单条数据
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

// ══════════════════════════════════════════
// 🕐 定时推送接口（供 cron-job.org 调用）
// ══════════════════════════════════════════

// 方糖 SendKey（优先使用环境变量，否则使用默认值）
const SERVERCHAN_SENDKEY = process.env.SERVERCHAN_SENDKEY || 'SCT398228T5tv0FscRox1UARF6zU2nlMuv';
// 推送接口的访问密钥
const CRON_SECRET = process.env.CRON_SECRET || 'tsmfuser';

// 根据 SendKey 构造推送 URL（兼容新旧格式）
function buildPushUrl(sendkey) {
    let uid = '';
    // 新版 Server酱³ 格式：SCT 开头，例如 SCT398228T5tv0FscRox1UARF6zU2nlMuv
    if (sendkey.startsWith('SCT')) {
        const match = sendkey.match(/^SCT(\d+)T/);
        if (match) uid = match[1];
    }
    // 旧版 Server酱 格式：sctp 开头
    else if (sendkey.startsWith('sctp')) {
        const match = sendkey.match(/^sctp(\d+)t/);
        if (match) uid = match[1];
    }

    if (!uid) {
        throw new Error('无法从 SendKey 中解析出 uid，请检查 SendKey 格式');
    }
    return `https://${uid}.push.ft07.com/send/${sendkey}.send`;
}

// 格式化日期
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}`;
}

// 构建推送内容（Markdown 格式）
function buildPushContent(data, start, end) {
    const count = data.length;

    if (count === 0) {
        return {
            title: '📋 客商信息日汇总（0条）',
            desp: `**统计时间段**：${formatDate(start)} ~ ${formatDate(end)}\n\n**今日无新增客商信息** ✅\n\n无需录入EAS系统。`
        };
    }

    const customerCount = data.filter(c => c.entryType === '客户').length;
    const supplierCount = data.filter(c => c.entryType === '供应商').length;
    const enterpriseCount = data.filter(c => c.entityType === '企业').length;
    const individualCount = data.filter(c => c.entityType === '个人').length;

    let desp = `**统计时间段**：${formatDate(start)} ~ ${formatDate(end)}\n\n`;
    desp += `## 📊 数据概览\n`;
    desp += `- 新增总数：**${count}** 条\n`;
    desp += `- 客户：${customerCount} 条 ｜ 供应商：${supplierCount} 条\n`;
    desp += `- 企业：${enterpriseCount} 条 ｜ 个人：${individualCount} 条\n\n`;
    desp += `## 📝 明细列表\n\n`;

    data.forEach((c, index) => {
        const typeTag = c.entryType === '供应商' ? '🟠供应商' : '🔵客户';
        const entityTag = c.entityType === '个人' ? '👤个人' : '🏢企业';
        desp += `${index + 1}. **${c.companyName}** [${typeTag} · ${entityTag}]\n`;
        desp += `   证件号：${c.idNumber}\n`;
        desp += `   联系人：${c.contactName || '未填'} ｜ 电话：${c.contactPhone || '未填'}\n`;
        desp += `   业务员：${c.salesman} ｜ 分配：${(c.assignedCompanies || []).join('、')}\n\n`;
    });

    return {
        title: `📋 客商信息日汇总（${count}条）`,
        desp: desp
    };
}

// 推送接口（由 cron-job.org 调用）
app.get('/api/cron/push', async (req, res) => {
    // 验证密钥
    const secret = req.query.secret;
    if (!secret || secret !== CRON_SECRET) {
        return res.status(403).json({ code: 403, message: '未授权访问' });
    }

    if (!SERVERCHAN_SENDKEY) {
        return res.status(500).json({ code: 500, message: '未配置 SERVERCHAN_SENDKEY' });
    }

    try {
        // 计算时间段：昨天 20:00 到 今天 20:00
        const now = new Date();
        const end = new Date(now);
        end.setHours(20, 0, 0, 0);
        const start = new Date(end);
        start.setDate(start.getDate() - 1);

        // 查询数据
        const customers = await Customer.find({
            createdAt: { $gte: start, $lte: end }
        }).sort({ createdAt: -1 });

        const data = customers.map(c => ({
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

        // 构建推送内容
        const { title, desp } = buildPushContent(data, start, end);

        // 构造推送 URL
        const pushUrl = buildPushUrl(SERVERCHAN_SENDKEY);

        // 通过方糖推送
        const pushRes = await fetch(pushUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, desp })
        });
        const pushResult = await pushRes.json();

        console.log(`✅ 推送完成：${title}，方糖返回：`, pushResult);

        res.json({
            code: 0,
            message: `推送成功，共 ${data.length} 条数据`,
            count: data.length,
            title: title,
            pushResult: pushResult
        });

    } catch (err) {
        console.error('❌ 推送失败：', err);
        res.status(500).json({ code: 500, message: '推送失败', error: err.message });
    }
});

app.listen(port, () => {
    console.log(`🚀 服务已启动！`);
    console.log(`📱 手机填写页面（公开）：http://localhost:${port}/client.html`);
    console.log(`💻 后台管理（需登录）：http://localhost:${port}/dashboard.html`);
    console.log(`🕐 定时推送接口：http://localhost:${port}/api/cron/push?secret=${CRON_SECRET}`);
});
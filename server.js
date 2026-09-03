const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ─── 连接云数据库 ───
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/customerDB';
mongoose.connect(mongoURI)
  .then(() => console.log('✅ 云数据库连接成功！'))
  .catch(err => console.log('❌ 数据库连接失败', err));

// ─── 定义数据结构（Schema） ───
const customerSchema = new mongoose.Schema({
  companyName: { type: String, required: true },        // 公司名称（必填）
  creditCode: { type: String, required: true },         // ⭐ 统一社会信用代码（改为必填）
  contactName: String,                                  // 客户姓名
  contactPhone: String,                                 // 客户电话
  salesman: { type: String, required: true },           // 业务员（必填）
  assignedCompanies: { type: [String], required: true },// ⭐ 分配公司（多选，必填）
  createdAt: { type: Date, default: Date.now }          // ⭐ 改为日期类型（方便按天分组）
});
const Customer = mongoose.model('Customer', customerSchema);

// ─── API 接口 ───

// 1. 新增客户（手机端调用）
app.post('/api/customers', async (req, res) => {
  try {
    const { companyName, creditCode, contactName, contactPhone, salesman, assignedCompanies } = req.body;

    // 必填项校验
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

// 2. 查询所有客户（周一你看的数据）
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 }); // 按时间倒序
    const data = customers.map(c => ({
      id: c._id,
      companyName: c.companyName,
      creditCode: c.creditCode,
      contactName: c.contactName,
      contactPhone: c.contactPhone,
      salesman: c.salesman,
      assignedCompanies: c.assignedCompanies,
      createdAt: c.createdAt // 直接返回日期对象，前端格式化
    }));
    res.json({ code: 0, message: 'success', data });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 3. 删除单个客户
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
  console.log(`📱 手机填写页面：http://localhost:${port}/client.html`);
  console.log(`💻 周一查看后台：http://localhost:${port}/dashboard.html`);
});
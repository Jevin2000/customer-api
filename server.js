const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // 引入云数据库驱动
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// 托管 HTML 页面，方便通过浏览器直接访问
app.use(express.static(__dirname));

// ─── 1️⃣ 连接云数据库（从环境变量读取地址） ───
// 注意：MONGO_URI 就是刚才你保存的那个长字符串
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/customerDB';
mongoose.connect(mongoURI)
  .then(() => console.log('✅ 云数据库连接成功！数据永久保存'))
  .catch(err => console.log('❌ 数据库连接失败，请检查连接字符串', err));

// ─── 2️⃣ 定义客户信息的数据结构（Schema） ───
const customerSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  creditCode: String,
  contactName: String,
  contactPhone: String,
  salesman: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toLocaleString('zh-CN', { hour12: false }) }
});
const Customer = mongoose.model('Customer', customerSchema);

// ─── 3️⃣ API 接口（和之前功能一样，但数据存云上） ───

// 新增客户
app.post('/api/customers', async (req, res) => {
  try {
    const { companyName, creditCode, contactName, contactPhone, salesman } = req.body;
    if (!companyName) return res.status(400).json({ code: 400, message: '公司名称不能为空' });
    if (!salesman) return res.status(400).json({ code: 400, message: '业务员姓名不能为空' });

    const newCustomer = new Customer({ companyName, creditCode, contactName, contactPhone, salesman });
    await newCustomer.save();

    // 返回给前端的数据（把 _id 映射成 id）
    res.json({ code: 0, message: '客户信息提交成功！', data: { id: newCustomer._id, ...newCustomer._doc } });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误', error: err.message });
  }
});

// 查询所有客户（周一你看的数据）
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ _id: -1 }); // 最新在前
    const data = customers.map(c => ({
      id: c._id,
      companyName: c.companyName,
      creditCode: c.creditCode,
      contactName: c.contactName,
      contactPhone: c.contactPhone,
      salesman: c.salesman,
      createdAt: c.createdAt
    }));
    res.json({ code: 0, message: 'success', data });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 删除客户
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
var express = require('express');
var router = express.Router();

const Distributors = require('../models/distributors')
const Users = require('../models/users')
const Upload = require('../config/common/upload');

//get Distributor
router.get('/get-list-distributor', async (req, res) => {
    try {
        const data = await Distributors.find().populate();
        res.json({
            "status": 200,
            "messenger": "Danh sách distributor",
            "data": data
        })
    } catch (error) {
        console.log(error);
    }
})
//add Distributor
router.post('/add-distributor', async (req, res) => {
    try {
        const data = req.body;
        console.log(data)
        const newDistributors = new Distributors({
            name: data.name
        });
        const result = await newDistributors.save();

        const list = await Distributors.find().populate();

        if (result) {
            res.json({
                "status": 200,
                "messenger": "Thêm thành công",
                "data": list
            })
        } else {
            res.json({
                "status": 400,
                "messenger": "Lỗi thêm không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})
//update Distributor
router.put('/update-distributor-by-id/:id', async (req, res) => {
    try {
        const { id } = req.params
        console.log(id);
        const data = req.body
        const updateDistributor = await Distributors.findById(id)
        let result = null;
        if (updateDistributor) {
            updateDistributor.name = data.name ?? updateDistributor.name

            result = await updateDistributor.save();
        }
        if (result) {

            const list = await Distributors.find().populate();
            res.json({
                'status': 200,
                'messenger': 'Cập nhật thành công',
                'data': list
            })
        } else {
            res.json({
                'status': 400,
                'messenger': 'Cập nhật không thành công',
                'data': []
            })
        }
    } catch (error) {
        console.log(error);
    }
})
//delete Distributor
router.delete('/destroy-distributor-by-id/:id', async (req, res) => {
    try {
        const { id } = req.params
        const result = await Distributors.findByIdAndDelete(id);
        if (result) {

            const list = await Distributors.find().populate();
            res.json({
                "status": 200,
                "messenger": "Xóa thành công",
                "data": list
            })
        } else {
            res.json({
                "status": 400,
                "messenger": "Lỗi! xóa không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})
//search Distributor
router.get('/search-distributor', async (req, res) => {
    try {
        const key = req.query.key

        const data = await Distributors.find({ name: { "$regex": key, "$options": "i" } })
            .sort({ createdAt: -1 });

        if (data) {
            res.json({
                "status": 200,
                "messenger": "Thành công",
                "data": data
            })
        } else {
            res.json({
                "status": 400,
                "messenger": "Lỗi, không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})



router.post('/add-user', Upload.single('avartar'), async (req, res) => {
    try {
        const data = req.body;
        const file = req.file;
        const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

        const newUser = new Users({
            username: data.username,
            password: data.password,
            email: data.email,
            name: data.name,
            avartar: imageUrl,
        });

        const result = await newUser.save();
        if (result) {
            res.json({
                "status": 200,
                "message": "Thêm thành công",
                "data": result
            });
        } else {
            res.json({
                "status": 400,
                "message": "Thêm không thành công",
                "data": []
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "status": 500,
            "message": "Đã xảy ra lỗi",
            "data": []
        });
    }
});

router.get('/getAllUser', async (req, res) => {
    try {
        const users = await Users.find();
        res.status(200).json({
            status: 200,
            message: 'Danh sách người dùng',
            data: users
        });
    } catch (error) {
        console.log(error);
    }

})

const Transporter = require('../config/common/mail')
router.post('/register-send-email', Upload.single('avartar'), async (req, res) => {
    try {
        const data = req.body;
        const { file } = req
        const newUser = Users({
            username: data.username,
            password: data.password,
            email: data.email,
            name: data.name,
            avartar: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
            //url avatar http://localhost:3000/uploads/filename
        })
        const result = await newUser.save()
        if (result) { //Gửi mail
            const mailOptions = {
                from: "thanghtph31577@fpt.edu.vn", //email gửi đi
                to: result.email, // email nhận
                subject: "Đăng ký thành công", //subject
                text: "Cảm ơn bạn đã đăng ký", // nội dung mail
            };
            // Nếu thêm thành công result !null trả về dữ liệu
            await Transporter.sendMail(mailOptions); // gửi mail
            res.json({
                "status": 200,
                "messenger": "Thêm thành công",
                "data": result
            })
        } else {// Nếu thêm không thành công result null, thông báo không thành công
            res.json({
                "status": 400,
                "messenger": "Lỗi, thêm không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})


const JWT = require('jsonwebtoken');
const SECRETKEY = "FPTPOLYTECHNIC"
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await Users.findOne({ username, password })
        if (user) {
            //Token người dùng sẽ sử dụng gửi lên trên header mỗi lần muốn gọi api
            const token = JWT.sign({ id: user._id }, SECRETKEY, { expiresIn: '1h' });
            //Khi token hết hạn, người dùng sẽ call 1 api khác để lấy token mới
            //Lúc này người dùng sẽ truyền refreshToken lên để nhận về 1 cặp token,refreshToken mới
            //Nếu cả 2 token đều hết hạn người dùng sẽ phải thoát app và đăng nhập lại
            const refreshToken = JWT.sign({ id: user._id }, SECRETKEY, { expiresIn: '1d' })
            //expiresIn thời gian token
            res.json({
                "status": 200,
                "messenger": "Đăng nhâp thành công",
                "data": user,
                "token": token,
                "refreshToken": refreshToken
            })
        } else {
            // Nếu thêm không thành công result null, thông báo không thành công
            res.json({
                "status": 400,
                "messenger": "Lỗi, đăng nhập không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})











module.exports = router;

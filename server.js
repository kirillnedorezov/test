const express = require('express');
const bodyParser = require('body-parser');
const Datastore = require('nedb');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

const db = new Datastore({ filename: 'orders.db', autoload: true });

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/save-order', (req, res) => {
    const order = req.body;
    db.insert(order, (err, newDoc) => {
        if (err) {
            res.status(500).send({ success: false, error: 'Ошибка при сохранении заказа' });
        } else {
            sendOrderEmail(order);
            res.send({ success: true, id: newDoc._id });
        }
    });
});

app.get('/orders', (req, res) => {
    db.find({}, (err, docs) => {
        if (err) {
            res.status(500).send({ success: false, error: 'Ошибка при получении заказов' });
        } else {
            res.send(docs);
        }
    });
});

function sendOrderEmail(order) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: '@gmail.com',
            pass: 'your-email-password'
        }
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: 'recipient-email@gmail.com',
        subject: 'Новый заказ',
        text: `Имя: ${order.name}\nТелефон: ${order.phone}\nАдрес: ${order.address}\nТовары:\n${order.items.map(item => `${item.name} - ${item.price} руб.`).join('\n')}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
}

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});

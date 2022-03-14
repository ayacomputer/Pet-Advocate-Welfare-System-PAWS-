const router = require('express').Router();
const { Booking, Pet } = require('../../models');
const withAuth = require('../../utils/auth');
require('dotenv').config();
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const { findByPk } = require('../../models/Staff');
const session = require('express-session')

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


// Creates a new booking and sends email
router.post("/", withAuth, async (req, res) => {
    try {

        const newPet = await Pet.create({
            pet_name: req.body.pet_name,
            owner_name: req.body.owner_name,
            pet_type: req.body.pet_type,
            pet_breed: req.body.pet_breed,
            pet_notes: req.body.pet_notes,
        });

        const newBooking = await Booking.create({
            date_dropoff: req.body.date_dropoff,
            date_pickup: req.body.date_pickup,
            fee: req.body.fee,
            staff_id: req.body.staff_id,
            pet_id: newPet.id,
        });
        console.log("req.session----------------------------------");
        console.log(req.session);

        const output = `
        <p>The following booking has been created:</p>
        <p>Pet Name: ${req.body.pet_name}</p>
        <p>Type: ${req.body.pet_type} </p>
        <p> Breed:${req.body.pet_breed}</p>
        <p>Note: ${req.body.pet_notes}</p>
        <p>Type: ${req.body.pet_type}</p>
        <p>Breed: ${req.body.pet_breed}</p>
        <p>Owner: ${req.body.owner_name}</p>
        <p>Drop off: ${req.body.date_dropoff}</p>
        <p> Pick up: ${req.body.date_pickup}</p>
        <p>Fee: ${req.body.fee}</p>
        Kind regards,
        PAWS Team`;

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.DB_EMAIL, // generated ethereal user
                pass: process.env.DB_EMAIL_PASSWORD  // generated ethereal password
            },
            tls: {
                rejectUnauthorized: false
            }
        });



        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Pet Advocate Welfare System" <petadvocatewelfaresystem@gmail.com>', // sender address
            to: req.session.email, //  receivers
            bcc: '"Pet Advocate Welfare System" <petadvocatewelfaresystem@gmail.com>',
            subject: 'New Booking has been created.', // Subject line
            text: '', // plain text body
            html: output // html body
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        });

        res.status(200).json({ newBooking, newPet });

    } catch (err) {
        res.status(500).json(err);
    }
});

// Updates a booking, and sends email
router.put("/:id", withAuth, async (req, res) => {
    try {
        const bookingData = await Booking.update({
            ...req.body,
        },
            {
                where: {
                    id: req.params.id,
                },
            });

        const petData = await Pet.update({
            ...req.body,
        },
            {
                where: {
                    id: req.body.pet_id,
                },
            });

        if (!bookingData) {
            res.status(404).json({ message: 'No booking found with this id!' });
            return;
        }

        // setup email contents 
        const output = `
        <p>The following booking has been updated:</p>
        <p>Pet Name: ${req.body.pet_name}</p>
        <p>Type: ${req.body.pet_type} </p>
        <p> Breed:${req.body.pet_breed}</p>
        <p>Note: ${req.body.pet_notes}</p>
        <p>Type: ${req.body.pet_type}</p>
        <p>Breed: ${req.body.pet_breed}</p>
        <p>Owner: ${req.body.owner_name}</p>
        <p>Drop off: ${req.body.date_dropoff}</p>
        <p> Pick up: ${req.body.date_pickup}</p>
        <p>Fee: ${req.body.fee}</p>
        Kind regards,
        PAWS Team`;

        // setup transport
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.DB_EMAIL,
                pass: process.env.DB_EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Pet Advocate Welfare System" <petadvocatewelfaresystem@gmail.com>', // sender address
            to: req.session.email, // list of receivers
            bcc: '"Pet Advocate Welfare System" <petadvocatewelfaresystem@gmail.com>',
            subject: 'Booking has been updated.', // Subject line
            text: '', // plain text body
            html: output // html body
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        });

        res.status(200).json({ bookingData, petData });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Deletes a booking
router.delete("/:id", withAuth, async (req, res) => {
    try {
        const bookingData = await Booking.destroy({
            where: {
                id: req.params.id,
            },
        });

        if (!bookingData) {
            res.status(404).json({ message: 'No booking found with this id!' });
            return;
        }

        res.status(200).json(bookingData);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;

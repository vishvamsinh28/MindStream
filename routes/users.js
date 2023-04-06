const express = require('express')
const bcrypt = require("bcrypt")
const router = express.Router()
const mongoose = require('mongoose');
const User = require('../models/user');
const session = require('express-session');

router.get('/login',(req,res)=>{
    res.render('login.ejs' ,{message : req.flash('message')});
})
  
router.get('/register',(req,res)=>{
    res.render('register.ejs',{message : req.flash('message')});
})

router.post('/register', async (req,res)=>{
    try{
        const {email , firstname , lastname , password , username } = req.body;
        const user = new User({firstname,lastname,email,username,password})
        const findUser = await User.findOne({username:username})
        if(findUser){
            req.flash('message' , 'User already exists try again')
            res.redirect('/register')
        }else{
            req.flash("message","Account created please login to continue")
            await user.save()
            res.redirect("/login")
        }
       
    }catch (err){
        res.render("error.ejs",{err})
    }
})

router.post('/login',async(req,res)=>{
    try{
        const user = await User.findOne({username: req.body.username})
        if(user){
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if(validPassword){
                req.session.user_id = user._id;
                req.session.username = user.username;
                res.redirect('/')
            }else{
                req.flash('message',"Wrong Password!")
                res.redirect('/login')
            }
        }else{
            req.flash("message","No user found create new")
            res.redirect('/register')
        }
    }catch(err){
        res.render('error',{err})
    }
})

router.get('/logout',(req,res)=>{
    req.session.destroy();
    res.redirect('/')
})

module.exports = router
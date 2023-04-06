const express = require('express')
const router = express.Router()
const mongoose = require('mongoose');
const auth = require('../auth')
const Post = require('../models/post')
const User = require('../models/user');
const Comment = require('../models/comment')
const { route } = require('./users');
const { findById } = require('../models/user');
const comment = require('../models/comment');
router.use(auth)

router.get("/",auth, async (req,res)=>{
    const post = await Post.find({}).populate('author');
    // console.log(post)
    res.render('dashboard.ejs',{post , message : req.flash('message')})
})

router.get('/write',auth,(req,res)=>{
    res.render('write_post.ejs')
})

router.post('/write',auth, async (req, res) => {
    const { title, body } = req.body;
    const author = req.session.user_id;
    const date = Date.now();
    const post = new Post({ title, body, author, date });
    
    try {
      const user = await User.findOne({ _id: author });
      await post.save();
      user.posts.push(post);
      await user.save();
      req.flash('message',"Post Published!")
      res.redirect('/dashboard');
    } catch (err) {
        res.render('error.ejs',{err})
    }
  });
  
router.get("/myblogs",auth,async (req,res)=>{
    const user = await User.findOne({username:req.session.username}).populate('posts');
    // console.log(user);
    res.render("myblogs.ejs",{user})
})

router.get("/read/:id",async (req,res)=>{
    try{
        const {id}=req.params;
        const currentUser = req.session.username
        const post = await Post.findOne({_id:req.params.id}).populate('author')
        const comments = await Comment.find({post:id}).populate('author')
        res.render("read.ejs",{post,currentUser,comments})
    }catch(err){
        res.render('error.ejs',{err})
    }

})

router.get("/read/:id/edit",async(req,res)=>{
    try{
        const post = await Post.findOne({_id:req.params.id}).populate('author')
        const currentUser = req.session.username
        if(currentUser !== post.author.username){
            return res.redirect("/dashboard")
        }
        res.render("edit.ejs",{post})
    }catch(err){
        res.render('error.ejs',{err})
    }
})

router.put('/read/:id/edit', async (req, res) => {
    try{
        const { id } = req.params;
        const { title, body } = req.body;
        const post = await Post.findByIdAndUpdate(id, { title: title, body: body });
        req.flash('message',"Changes made successfully!")
        res.redirect("/dashboard");
    }catch(err){
        res.render('error',{err})
    }
});

router.delete('/read/:id/delete',async(req,res)=>{
    try{
        const {id}=req.params
        await Post.findByIdAndDelete(id)
        req.flash("message","Post deleted!")
        res.redirect("/dashboard")
    }catch(err){
        res.render('error.ejs',{err})
    }
})

router.post("/:id/comment",async(req,res)=>{
    try{
        const {id}=req.params;
        const author = req.session.user_id
        const body = req.body.body
        const comment = new Comment({body:body,post:id,author:author})
        await comment.save()
        const post = await Post.findById({_id:id})
        post.comments.push(comment);
        await post.save()
        res.redirect('/dashboard/read/'+id)
    }catch(err){
        res.render('error',{err})
    }
})

router.delete("/:id/comment",async(req,res)=>{
    try{
        const {id}=req.params
        await Comment.findByIdAndDelete(id)
        res.redirect(req.get('referer'));
    }catch(err){
        res.render('error',{err})
    }
})

module.exports = router
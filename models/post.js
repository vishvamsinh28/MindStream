const mongoose = require('mongoose');
const Comment = require('./comment');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type:String,
        required: true
    },
    date:{
        type:Date,
        required: true
    },
    body:{
        type:String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    comments:[{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }]
});


postSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Comment.deleteMany({
            _id: {
                $in: doc.comments
            }
        })
    }
})

module.exports = mongoose.model("Post", postSchema);
import mongoose from 'mongoose'

const tweetSchema = mongoose.Schema({
    content: {
        type: String,
        required: true,
        maxlength: 280        
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likesCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

export default mongoose.model('Tweet', tweetSchema)
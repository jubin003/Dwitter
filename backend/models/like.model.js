import mongoose from 'mongoose'

const likeSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tweetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
        required: true
    }
}, { timestamps: true })

likeSchema.index({ userId: 1, tweetId: 1 }, { unique: true })

export default mongoose.model('Like', likeSchema)
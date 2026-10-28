
import mongoose from "mongoose";

export const ROLES =['admin', 'viewer', 'editor']
export const STATUS =['active', 'inactive']
const userSchema = new mongoose.Schema (
    {
        name: {
            type:String,
            required: [true, "Name is required"],
            trim:true,
            maxLength: [30, "Name cannot exceed 30 characters"],
        },
        email:{
            type:String,
            required: [true, "Email is required"],
            trim:true,
            lowercase:true,
            unique:true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address']
        },
        phone :{
            type:String,
            trim:true,
            default:""
        },
        role:{
            type:String,
            enum: ROLES,
            default:'viewer',
        },
        status: {
            type: String,
            enum: STATUS,
            default: 'active',
        }
    },{
        timestamps: true
    }
)

export default mongoose.model('User', userSchema)
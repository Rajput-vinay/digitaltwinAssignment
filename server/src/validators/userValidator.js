import {z} from 'zod'
import { ROLES, STATUS } from '../models/User.js';


export const userSchema = z.object({
    name:z.string().trim().min(1,"Name is required").max(30,"Name cannot exceed 30 characters"),
    email:z.string().trim().toLowerCase().email("Enter a valid email address"),
    phone: z.string().trim().regex(/^[+\d][\d\s\-()]{5,19}$/, 'Enter a valid phone number').or(z.literal("")).optional(),
    role:z.enum(ROLES).default('viewer'),
    status:z.enum(STATUS).default('active')
 }) 

export function validateUser(body = {}, { partial = false } = {}) {
    const schema = partial ? userSchema.partial() : userSchema;
    const result = schema.safeParse(body);

    if (!result.success) {
        const errors = {};

        for (const issue of result.error.issues) {
            const field = issue.path[0];
            if (field && !errors[field]) {
                errors[field] = issue.message;
            }
        }

        return { errors, data: {} };
    }

    return { errors: {}, data: result.data };
}
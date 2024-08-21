import { Schema, model } from 'mongoose'

const mesaSchema = new Schema(
    {
        positionX: { type: String, required: true },
        positionY: { type: String, required: true },
        state: {
           type: {type:String ,
            enum:["Llamar","Pedir cuenta", "Libre"],
            default:"Libre", 
            required: true },
            text: {type:String, required: true, default:""}
        },
            
       
    },
    { timestamps: true, versionKey: false }
)

export const Product = model('Mesa', mesaSchema)

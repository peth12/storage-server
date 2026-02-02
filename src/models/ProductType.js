import mongoose from "mongoose";

const productTypeSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: [true, 'Product type name is required'],
            unique: true,
            trim: true
        },
        description: { 
            type: String, 
            required: [true, 'Description is required'],
            trim: true
        },
        price: { 
            type: Number, 
            required: [true, 'Price is required'],
            min: [0, 'Price must be positive']
        },
        category: { 
            type: String, 
            required: [true, 'Category is required'],
            trim: true
        },
        imageUrl: { 
            type: String, 
            required: [true, 'Image URL is required'],
            trim: true
        },
    },
    { 
        timestamps: true,
        collection: 'producttypes' // กำหนดชื่อ collection ใน MongoDB
    }
);

export default mongoose.model("ProductType", productTypeSchema);
import Bill from "../models/Bill.js"
import Product from "../models/Product.js"

export async function information(){
    const totalBills = await Bill.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalSoldProducts = await Product.find(
        { quantity: { $eq: 0 } }
    ).select("quantity").countDocuments();
    const incomeAgg = await Bill.aggregate([
        { $group: { _id: null, totalIncome: { $sum: "$total" } } }
    ]);
    const totalIncome = incomeAgg[0] ? incomeAgg[0].totalIncome : 0;
    return { totalBills, totalProducts, totalSoldProducts, totalIncome };
}
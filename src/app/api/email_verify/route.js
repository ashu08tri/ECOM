import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { Order } from '@/utils/schema';

if (!mongoose.connection.readyState) {
    mongoose.connect(process.env.MONGODB_URI).then(() => {
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.error('Connection to MongoDB failed:', err);
    });
}

export async function POST(request) {
    const { email, phone, isAdmin, filter, orderID } = await request.json();
    
    try {
        let query = {};

        // If the user is an admin, query all orders, otherwise query based on email
        if (!isAdmin && email || phone) {
            query.email = email;
            query.phoneNumber = phone;
        }

        // Apply additional filters if provided
        if (filter) {
            if (filter.email) {
                query.email = filter.email;
            }

            if (filter.date) {
                const startDate = new Date(filter.date);
                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 1);
                query.createdAt = { $gte: startDate, $lt: endDate };
            }
        }

        // Include orderId in the query if provided
        if (orderID) {
            query.orderID = orderID;
        }
        
        Object.keys(query).forEach(key => {
            if (query[key] === '') {
                delete query[key];
            }
        });

        // Fetch orders based on the query
        const orders = await Order.find(query).populate('products');

        if (orders.length > 0) {
            return NextResponse.json(orders);
        } else {
            const message = isAdmin
                ? 'No orders are placed yet!'
                : `No order is associated with given details!`;
            return NextResponse.json({ ok: false, message });
        }
    } catch (err) {
        console.error("Error in POST /api/orders:", err);
        return NextResponse.json({ ok: false, message: "Internal Server Error" });
    }
}

export async function GET() {
    try {
        const allOrders = await Order.find().select('email createdAt').lean();
        const emails = [...new Set(allOrders.map(order => order.email))];
        const dates = [...new Set(allOrders.map(order => order.createdAt.toISOString().split('T')[0]))];
        return NextResponse.json({ emails, dates });
    } catch (err) {
        return NextResponse.json({ err });
    }
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const brand_routes_1 = __importDefault(require("./routes/brand.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [
        'http://127.0.0.1:4173',
        'http://localhost:4173',
        'http://127.0.0.1:5173',
        'http://localhost:5173',
        'https://brand-6xqkgp1vj-lvmneos-projects.vercel.app/'
    ],
    credentials: true,
}));
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
app.get('/', (_req, res) => {
    res.json({ message: 'API is running' });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/brands', brand_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/reviews', review_routes_1.default);
exports.default = app;

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// ── Security ─────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(mongoSanitize());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── CORS ─────────────────────────────────────────────────────────────────────
const origins = [
  process.env.FRONTEND_URL,
  'https://snow-ant-943137.hostingersite.com',
  'http://localhost:3000',
  'http://localhost:3001',
];
app.use(cors({
  origin: (origin, cb) => (!origin || origins.includes(origin) ? cb(null, true) : cb(new Error('Not allowed by CORS'))),
  credentials: true,
}));

// ── Rate Limits ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 15 }));
app.use('/api/v1', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// ── Body Parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '250mb' }));
app.use(express.urlencoded({ extended: true, limit: '250mb' }));

// ── Static Files ──────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',        require('./routes/auth.routes'));
app.use('/api/v1/slides',      require('./routes/slide.routes'));
app.use('/api/v1/products',    require('./routes/product.routes'));
app.use('/api/v1/categories',  require('./routes/category.routes'));
app.use('/api/v1/services',    require('./routes/service.routes'));
app.use('/api/v1/blogs',       require('./routes/blog.routes'));
app.use('/api/v1/blog-categories', require('./routes/blogCategory.routes'));
app.use('/api/v1/faqs',        require('./routes/faq.routes'));
app.use('/api/v1/workshops',   require('./routes/workshop.routes'));
app.use('/api/v1/workshop-categories', require('./routes/workshopCategory.routes'));
app.use('/api/v1/portfolio',   require('./routes/portfolio.routes'));
app.use('/api/v1/enquiries',   require('./routes/enquiry.routes'));
app.use('/api/v1/media',       require('./routes/media.routes'));
app.use('/api/v1/settings',    require('./routes/setting.routes'));
app.use('/api/v1/seo',         require('./routes/seo.routes'));
app.use('/api/v1/testimonials',require('./routes/testimonial.routes'));
app.use('/api/v1/showcase-videos', require('./routes/index').showcaseVideoRouter);
app.use('/api/v1/brands',      require('./routes/brand.routes'));

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'OK', ts: new Date() }));
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Database + Start ──────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server on port ${process.env.PORT || 5000}`));
  })
  .catch(err => { console.error('❌ DB Error:', err); process.exit(1); });

module.exports = app;

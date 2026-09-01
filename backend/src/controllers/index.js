const jwt = require('jsonwebtoken');
const slugify = require('slugify');
const path = require('path');
const fs = require('fs');
const {
  User, Slide, ProductCategory, Product, Service,
  BlogCategory, Blog, FAQ, WorkshopCategory, Workshop,
  Portfolio, Enquiry, Media, Setting, SEO, Testimonial, ShowcaseVideo, Brand, Note,
} = require('../models');
const { asyncHandler, AppError } = require('../middleware/auth');

const sign = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
const sendToken = (user, code, res) => {
  const token = sign(user._id);
  res.status(code).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
};
const slug = (str, suffix = '') => slugify(str, { lower: true, strict: true }) + (suffix ? '-' + suffix : '');

// ── AUTH ──────────────────────────────────────────────────────────────────────
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Email and password required', 400);
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw new AppError('Invalid credentials', 401);
  if (!user.isActive) throw new AppError('Account disabled', 403);
  user.lastLogin = new Date(); await user.save({ validateBeforeSave: false });
  sendToken(user, 200, res);
});
exports.getMe = asyncHandler(async (req, res) => res.json({ success: true, user: req.user }));
exports.updateMe = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, { name: req.body.name, avatar: req.body.avatar }, { new: true });
  res.json({ success: true, user });
});
exports.changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(req.body.currentPassword))) throw new AppError('Wrong password', 401);
  user.password = req.body.newPassword; await user.save();
  sendToken(user, 200, res);
});
exports.createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({ name, email, password, role: role || 'admin' });
  res.status(201).json({ success: true, user: { id: user._id, name, email, role: user.role } });
});
exports.getAdmins = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.json({ success: true, users });
});
exports.toggleAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('Not found', 404);
  user.isActive = !user.isActive; await user.save();
  res.json({ success: true, user });
});
exports.getDashboard = asyncHandler(async (req, res) => {
  const [products, services, blogs, enquiries, workshops, portfolio, media, newEnq] = await Promise.all([
    Product.countDocuments(), Service.countDocuments(), Blog.countDocuments({ isPublished: true }),
    Enquiry.countDocuments(), Workshop.countDocuments(), Portfolio.countDocuments(),
    Media.countDocuments(), Enquiry.countDocuments({ status: 'new' }),
  ]);
  const recent = await Enquiry.find().sort('-createdAt').limit(6);
  res.json({ success: true, stats: { products, services, blogs, enquiries, workshops, portfolio, media, newEnq }, recent });
});

// ── SLIDES ────────────────────────────────────────────────────────────────────
exports.getSlides = asyncHandler(async (req, res) => {
  const q = { isActive: true }; if (req.query.page) q.page = req.query.page;
  res.json({ success: true, slides: await Slide.find(q).sort('order') });
});
exports.getAllSlides = asyncHandler(async (req, res) => {
  const q = {}; if (req.query.page) q.page = req.query.page;
  res.json({ success: true, slides: await Slide.find(q).sort('order') });
});
exports.createSlide   = asyncHandler(async (req, res) => res.status(201).json({ success: true, slide: await Slide.create(req.body) }));
exports.updateSlide   = asyncHandler(async (req, res) => {
  const slide = await Slide.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!slide) throw new AppError('Not found', 404);
  res.json({ success: true, slide });
});
exports.deleteSlide   = asyncHandler(async (req, res) => { await Slide.findByIdAndDelete(req.params.id); res.json({ success: true }); });
exports.reorderSlides = asyncHandler(async (req, res) => {
  await Promise.all(req.body.orders.map(({ id, order }) => Slide.findByIdAndUpdate(id, { order })));
  res.json({ success: true });
});

// ── PRODUCT CATEGORIES ────────────────────────────────────────────────────────
exports.getProdCats = asyncHandler(async (req, res) => res.json({ success: true, categories: await ProductCategory.find({ isActive: true }).sort('order') }));
exports.getAllProdCats = asyncHandler(async (req, res) => res.json({ success: true, categories: await ProductCategory.find().sort('order') }));
exports.createProdCat = asyncHandler(async (req, res) => { req.body.slug = slug(req.body.name); res.status(201).json({ success: true, category: await ProductCategory.create(req.body) }); });
exports.updateProdCat = asyncHandler(async (req, res) => {
  if (req.body.name) req.body.slug = slug(req.body.name);
  const cat = await ProductCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!cat) throw new AppError('Not found', 404);
  res.json({ success: true, category: cat });
});
exports.deleteProdCat = asyncHandler(async (req, res) => { await ProductCategory.findByIdAndDelete(req.params.id); res.json({ success: true }); });

// ── PRODUCTS ──────────────────────────────────────────────────────────────────
exports.getProducts = asyncHandler(async (req, res) => {
  const { category, featured, search, page = 1, limit = 12, sort = '-createdAt' } = req.query;
  const f = { isActive: true };
  if (category) f.category = category;
  if (featured === 'true') f.isFeatured = true;
  if (search) f.$or = [{ name: { $regex: search, $options: 'i' } }, { tags: { $in: [new RegExp(search, 'i')] } }];
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [products, total] = await Promise.all([
    Product.find(f).populate('category', 'name slug color').sort(sort).skip(skip).limit(parseInt(limit)),
    Product.countDocuments(f),
  ]);
  res.json({ success: true, products, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});
exports.getProduct = asyncHandler(async (req, res) => {
  const p = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('category');
  if (!p) throw new AppError('Not found', 404);
  res.json({ success: true, product: p });
});
exports.getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [products, total] = await Promise.all([Product.find().populate('category', 'name').sort('-createdAt').skip(skip).limit(parseInt(limit)), Product.countDocuments()]);
  res.json({ success: true, products, total, pages: Math.ceil(total / parseInt(limit)) });
});
exports.createProduct = asyncHandler(async (req, res) => { req.body.slug = slug(req.body.name, Date.now()); res.status(201).json({ success: true, product: await Product.create(req.body) }); });
exports.updateProduct = asyncHandler(async (req, res) => {
  if (req.body.name) req.body.slug = slug(req.body.name, req.params.id.slice(-6));
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!p) throw new AppError('Not found', 404);
  res.json({ success: true, product: p });
});
exports.deleteProduct = asyncHandler(async (req, res) => { await Product.findByIdAndDelete(req.params.id); res.json({ success: true }); });

// ── SERVICES ──────────────────────────────────────────────────────────────────
exports.getServices    = asyncHandler(async (req, res) => res.json({ success: true, services: await Service.find({ isActive: true }).sort('order') }));
exports.getAllServices  = asyncHandler(async (req, res) => res.json({ success: true, services: await Service.find().sort('order') }));
exports.getServiceBySlug = asyncHandler(async (req, res) => {
  // Try by slug first, then by _id as fallback
  let svc = await Service.findOne({ slug: req.params.slug, isActive: true });
  if (!svc) {
    // Fallback: if slug not found, try to find by generated slug from name
    svc = await Service.findOne({ isActive: true }).where('name').equals(
      req.params.slug.replace(/-/g, ' ')
    );
  }
  if (!svc) throw new AppError('Not found', 404);

  // Auto-fix: generate slug if missing
  if (!svc.slug) {
    svc.slug = require('slugify')(svc.name, { lower: true, strict: true });
    await svc.save();
  }

  const [relatedPortfolio, relatedBlogs, relatedProducts] = await Promise.all([
    Portfolio.find({ linkedServices: svc._id, isActive: true }).sort('order').limit(12),
    Blog.find({ linkedServices: svc._id, isPublished: true }).populate('category', 'name color').sort('-publishedAt').limit(6),
    Product.find({ linkedServices: svc._id, isActive: true }).populate('category', 'name slug color').sort('order').limit(8),
  ]);
  res.json({ success: true, service: svc, relatedPortfolio, relatedBlogs, relatedProducts });
});
exports.createService  = asyncHandler(async (req, res) => { req.body.slug = slug(req.body.name); res.status(201).json({ success: true, service: await Service.create(req.body) }); });
exports.updateService  = asyncHandler(async (req, res) => { if (req.body.name) req.body.slug = slug(req.body.name); const s = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!s) throw new AppError('Not found', 404); res.json({ success: true, service: s }); });
exports.deleteService  = asyncHandler(async (req, res) => { await Service.findByIdAndDelete(req.params.id); res.json({ success: true }); });

// ── FIX: Backfill slugs for existing services that have none ─────────────────
exports.fixServiceSlugs = asyncHandler(async (req, res) => {
  const svcs = await Service.find({ $or: [{ slug: '' }, { slug: null }, { slug: { $exists: false } }] });
  let fixed = 0;
  for (const svc of svcs) {
    svc.slug = slug(svc.name, svc._id.toString().slice(-4));
    await svc.save();
    fixed++;
  }
  res.json({ success: true, fixed, message: `${fixed} service(s) slug fixed` });
});

// ── BLOG CATEGORIES ───────────────────────────────────────────────────────────
exports.getBlogCats    = asyncHandler(async (req, res) => res.json({ success: true, categories: await BlogCategory.find({ isActive: true }).sort('order') }));
exports.getAllBlogCats  = asyncHandler(async (req, res) => res.json({ success: true, categories: await BlogCategory.find().sort('order') }));
exports.createBlogCat  = asyncHandler(async (req, res) => { req.body.slug = slug(req.body.name); res.status(201).json({ success: true, category: await BlogCategory.create(req.body) }); });
exports.updateBlogCat  = asyncHandler(async (req, res) => { const c = await BlogCategory.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, category: c }); });
exports.deleteBlogCat  = asyncHandler(async (req, res) => { await BlogCategory.findByIdAndDelete(req.params.id); res.json({ success: true }); });

// ── BLOGS ─────────────────────────────────────────────────────────────────────
exports.getBlogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 9, category, featured, service } = req.query;
  const f = { isPublished: true };
  if (category) f.category = category;
  if (featured === 'true') f.isFeatured = true;
  if (service) f.linkedServices = service;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [blogs, total] = await Promise.all([Blog.find(f).populate('category', 'name color').populate('linkedServices', 'name slug').sort('-publishedAt').skip(skip).limit(parseInt(limit)), Blog.countDocuments(f)]);
  res.json({ success: true, blogs, total, pages: Math.ceil(total / parseInt(limit)) });
});
exports.getBlog      = asyncHandler(async (req, res) => { const b = await Blog.findOneAndUpdate({ slug: req.params.slug, isPublished: true }, { $inc: { views: 1 } }, { new: true }).populate('category').populate('linkedServices', 'name slug'); if (!b) throw new AppError('Not found', 404); res.json({ success: true, blog: b }); });
exports.getAllBlogs   = asyncHandler(async (req, res) => res.json({ success: true, blogs: await Blog.find().populate('category', 'name').populate('linkedServices', 'name slug').sort('-createdAt') }));
exports.createBlog   = asyncHandler(async (req, res) => { req.body.slug = slug(req.body.title, Date.now()); if (req.body.isPublished) req.body.publishedAt = new Date(); res.status(201).json({ success: true, blog: await Blog.create(req.body) }); });
exports.updateBlog   = asyncHandler(async (req, res) => { if (req.body.title) req.body.slug = slug(req.body.title, req.params.id.slice(-6)); if (req.body.isPublished) req.body.publishedAt = req.body.publishedAt || new Date(); const b = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!b) throw new AppError('Not found', 404); res.json({ success: true, blog: b }); });
exports.deleteBlog   = asyncHandler(async (req, res) => { await Blog.findByIdAndDelete(req.params.id); res.json({ success: true }); });

// ── FAQs ──────────────────────────────────────────────────────────────────────
exports.getFAQs     = asyncHandler(async (req, res) => res.json({ success: true, faqs: await FAQ.find({ isActive: true }).sort('order') }));
exports.getAllFAQs   = asyncHandler(async (req, res) => res.json({ success: true, faqs: await FAQ.find().sort('order') }));
exports.createFAQ   = asyncHandler(async (req, res) => res.status(201).json({ success: true, faq: await FAQ.create(req.body) }));
exports.updateFAQ   = asyncHandler(async (req, res) => { const f = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!f) throw new AppError('Not found', 404); res.json({ success: true, faq: f }); });
exports.deleteFAQ   = asyncHandler(async (req, res) => { await FAQ.findByIdAndDelete(req.params.id); res.json({ success: true }); });

// ── WORKSHOP CATEGORIES ───────────────────────────────────────────────────────
exports.getWsCats   = asyncHandler(async (req, res) => res.json({ success: true, categories: await WorkshopCategory.find({ isActive: true }).sort('order') }));
exports.getAllWsCats = asyncHandler(async (req, res) => res.json({ success: true, categories: await WorkshopCategory.find().sort('order') }));
exports.createWsCat = asyncHandler(async (req, res) => { req.body.slug = slug(req.body.name); res.status(201).json({ success: true, category: await WorkshopCategory.create(req.body) }); });
exports.updateWsCat = asyncHandler(async (req, res) => { const c = await WorkshopCategory.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, category: c }); });
exports.deleteWsCat = asyncHandler(async (req, res) => { await WorkshopCategory.findByIdAndDelete(req.params.id); res.json({ success: true }); });

// ── WORKSHOPS ─────────────────────────────────────────────────────────────────
exports.getWorkshops  = asyncHandler(async (req, res) => { const { category, featured } = req.query; const f = { isActive: true }; if (category) f.category = category; if (featured === 'true') f.isFeatured = true; res.json({ success: true, workshops: await Workshop.find(f).populate('category', 'name color').sort('-date') }); });
exports.getWorkshop   = asyncHandler(async (req, res) => { const w = await Workshop.findOne({ slug: req.params.slug, isActive: true }).populate('category'); if (!w) throw new AppError('Not found', 404); res.json({ success: true, workshop: w }); });
exports.getAllWorkshops= asyncHandler(async (req, res) => res.json({ success: true, workshops: await Workshop.find().populate('category', 'name').sort('-createdAt') }));
exports.createWorkshop= asyncHandler(async (req, res) => { req.body.slug = slug(req.body.title, Date.now()); res.status(201).json({ success: true, workshop: await Workshop.create(req.body) }); });
exports.updateWorkshop= asyncHandler(async (req, res) => { const w = await Workshop.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!w) throw new AppError('Not found', 404); res.json({ success: true, workshop: w }); });
exports.deleteWorkshop= asyncHandler(async (req, res) => { await Workshop.findByIdAndDelete(req.params.id); res.json({ success: true }); });
exports.wsRegister    = asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;
  const w = await Workshop.findById(req.params.id); if (!w) throw new AppError('Not found', 404);
  w.registrations.push({ name, email, phone, message }); await w.save();
  await Enquiry.create({ name, email, phone, type: 'workshop', workshop: w._id, message: `Workshop: ${w.title}`, subject: 'Workshop Registration' });
  res.json({ success: true });
});

// ── PORTFOLIO ─────────────────────────────────────────────────────────────────
exports.getPortfolio    = asyncHandler(async (req, res) => { const { category, featured, service } = req.query; const f = { isActive: true }; if (category) f.category = category; if (featured === 'true') f.isFeatured = true; if (service) f.linkedServices = service; res.json({ success: true, portfolio: await Portfolio.find(f).populate('linkedServices', 'name slug').sort('order') }); });
exports.getAllPortfolio  = asyncHandler(async (req, res) => res.json({ success: true, portfolio: await Portfolio.find().populate('linkedServices', 'name slug').sort('-createdAt') }));
exports.createPortfolio = asyncHandler(async (req, res) => { req.body.slug = slug(req.body.title, Date.now()); res.status(201).json({ success: true, item: await Portfolio.create(req.body) }); });
exports.updatePortfolio = asyncHandler(async (req, res) => { const p = await Portfolio.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!p) throw new AppError('Not found', 404); res.json({ success: true, item: p }); });
exports.deletePortfolio = asyncHandler(async (req, res) => { await Portfolio.findByIdAndDelete(req.params.id); res.json({ success: true }); });

// ── ENQUIRIES ─────────────────────────────────────────────────────────────────
// ── ENQUIRIES ─────────────────────────────────────────────────────────────────
exports.createEnquiry = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) {
    data.fileUrl = `/uploads/enquiries/${req.file.filename}`;
    data.fileName = req.file.originalname;
  }
  res.status(201).json({ success: true, enquiry: await Enquiry.create(data) });
});
exports.getEnquiries  = asyncHandler(async (req, res) => {
  const { type, status, page = 1, limit = 20 } = req.query;
  const f = {}; if (type) f.type = type; if (status) f.status = status;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [enquiries, total] = await Promise.all([Enquiry.find(f).populate('workshop', 'title').sort('-createdAt').skip(skip).limit(parseInt(limit)), Enquiry.countDocuments(f)]);
  res.json({ success: true, enquiries, total, pages: Math.ceil(total / parseInt(limit)) });
});
exports.updateEnquiry = asyncHandler(async (req, res) => { const e = await Enquiry.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, enquiry: e }); });
exports.deleteEnquiry = asyncHandler(async (req, res) => { await Enquiry.findByIdAndDelete(req.params.id); res.json({ success: true }); });

// ── MEDIA ─────────────────────────────────────────────────────────────────────
exports.uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file', 400);
  const { file } = req;
  const type = file.mimetype.startsWith('image/') ? 'image' : file.mimetype.startsWith('video/') ? 'video' : file.mimetype === 'application/pdf' ? 'pdf' : 'document';
  const url = `/uploads/${req.uploadFolder || 'general'}/${file.filename}`;
  const media = await Media.create({ filename: file.filename, originalName: file.originalname, url, type, size: file.size, mimeType: file.mimetype, folder: req.uploadFolder || 'general', uploadedBy: req.user._id, alt: req.body.alt || file.originalname });
  res.status(201).json({ success: true, media });
});
exports.getMedia     = asyncHandler(async (req, res) => { const { type, page = 1, limit = 24 } = req.query; const f = type ? { type } : {}; const skip = (parseInt(page)-1)*parseInt(limit); const [media, total] = await Promise.all([Media.find(f).sort('-createdAt').skip(skip).limit(parseInt(limit)), Media.countDocuments(f)]); res.json({ success: true, media, total, pages: Math.ceil(total/parseInt(limit)) }); });
exports.deleteMedia  = asyncHandler(async (req, res) => { const m = await Media.findById(req.params.id); if (!m) throw new AppError('Not found', 404); const fp = path.join(__dirname, '../../public', m.url); if (fs.existsSync(fp)) fs.unlinkSync(fp); await m.deleteOne(); res.json({ success: true }); });
exports.updateMedia  = asyncHandler(async (req, res) => { const m = await Media.findByIdAndUpdate(req.params.id, { alt: req.body.alt }, { new: true }); res.json({ success: true, media: m }); });

// ── SETTINGS ──────────────────────────────────────────────────────────────────
exports.getSettings  = asyncHandler(async (req, res) => { const all = await Setting.find(); const map = {}; all.forEach(s => map[s.key] = s.value); res.json({ success: true, settings: map }); });
exports.upsertSetting = asyncHandler(async (req, res) => { const { key, value, group, label } = req.body; const s = await Setting.findOneAndUpdate({ key }, { value, group, label }, { new: true, upsert: true }); res.json({ success: true, setting: s }); });
exports.bulkSettings  = asyncHandler(async (req, res) => { await Promise.all(req.body.settings.map(s => Setting.findOneAndUpdate({ key: s.key }, s, { upsert: true }))); res.json({ success: true }); });

// ── SEO ───────────────────────────────────────────────────────────────────────
exports.getSEO     = asyncHandler(async (req, res) => { const s = await SEO.findOne({ page: req.params.page }); res.json({ success: true, seo: s || {} }); });
exports.getAllSEO   = asyncHandler(async (req, res) => res.json({ success: true, seos: await SEO.find() }));
exports.upsertSEO  = asyncHandler(async (req, res) => { const s = await SEO.findOneAndUpdate({ page: req.params.page }, req.body, { new: true, upsert: true }); res.json({ success: true, seo: s }); });

// ── TESTIMONIALS ──────────────────────────────────────────────────────────────
exports.getTestimonials    = asyncHandler(async (req, res) => res.json({ success: true, testimonials: await Testimonial.find({ isActive: true }).sort('order') }));
exports.getAllTestimonials  = asyncHandler(async (req, res) => res.json({ success: true, testimonials: await Testimonial.find().sort('-createdAt') }));
exports.createTestimonial  = asyncHandler(async (req, res) => res.status(201).json({ success: true, testimonial: await Testimonial.create(req.body) }));
exports.updateTestimonial  = asyncHandler(async (req, res) => { const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, testimonial: t }); });
exports.deleteTestimonial  = asyncHandler(async (req, res) => { await Testimonial.findByIdAndDelete(req.params.id); res.json({ success: true }); });

// ── SHOWCASE VIDEOS ───────────────────────────────────────────────────────────
exports.getShowcaseVideos    = asyncHandler(async (req, res) => res.json({ success: true, videos: await ShowcaseVideo.find({ isActive: true }).sort('order') }));
exports.getAllShowcaseVideos  = asyncHandler(async (req, res) => res.json({ success: true, videos: await ShowcaseVideo.find().sort('-createdAt') }));
exports.createShowcaseVideo  = asyncHandler(async (req, res) => res.status(201).json({ success: true, video: await ShowcaseVideo.create(req.body) }));
exports.updateShowcaseVideo  = asyncHandler(async (req, res) => { const v = await ShowcaseVideo.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!v) throw new AppError('Not found', 404); res.json({ success: true, video: v }); });
exports.deleteShowcaseVideo  = asyncHandler(async (req, res) => { await ShowcaseVideo.findByIdAndDelete(req.params.id); res.json({ success: true }); });

// ── NOTES ─────────────────────────────────────────────────────────────────────
exports.getNotes = asyncHandler(async (req, res) => {
  const { category, search, pinned, archived = 'false' } = req.query;
  const f = { isArchived: archived === 'true' };
  if (category && category !== 'All') f.category = category;
  if (pinned === 'true') f.isPinned = true;
  if (search) f.$or = [
    { title:   { $regex: search, $options: 'i' } },
    { content: { $regex: search, $options: 'i' } },
    { tags:    { $in: [new RegExp(search, 'i')] } },
  ];
  const notes = await Note.find(f).sort({ isPinned: -1, updatedAt: -1 });
  res.json({ success: true, notes });
});
exports.createNote = asyncHandler(async (req, res) => {
  const note = await Note.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, note });
});
exports.updateNote = asyncHandler(async (req, res) => {
  const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!note) throw new AppError('Not found', 404);
  res.json({ success: true, note });
});
exports.deleteNote = asyncHandler(async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});


exports.getBrands     = asyncHandler(async (req, res) => res.json({ success: true, brands: await Brand.find({ isActive: true }).sort('order') }));
exports.getAllBrands   = asyncHandler(async (req, res) => res.json({ success: true, brands: await Brand.find().sort('order') }));
exports.createBrand   = asyncHandler(async (req, res) => res.status(201).json({ success: true, brand: await Brand.create(req.body) }));
exports.updateBrand   = asyncHandler(async (req, res) => { const b = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!b) throw new AppError('Not found', 404); res.json({ success: true, brand: b }); });
exports.deleteBrand   = asyncHandler(async (req, res) => { await Brand.findByIdAndDelete(req.params.id); res.json({ success: true }); });
exports.reorderBrands = asyncHandler(async (req, res) => { await Promise.all(req.body.orders.map(({ id, order }) => Brand.findByIdAndUpdate(id, { order }))); res.json({ success: true }); });

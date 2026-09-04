const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── TEXT STYLE BLOCK ──────────────────────────────────────────────────────────
const textStyleSchema = new mongoose.Schema({
  text:       { type: String, default: '' },
  color:      { type: String, default: '#f5f0ea' },
  fontSize:   { type: String, default: '16px' },
  fontWeight: { type: String, default: '400' },
  fontFamily: { type: String, default: 'Syne' },
  textAlign:  { type: String, default: 'left' },
  italic:     { type: Boolean, default: false },
  uppercase:  { type: Boolean, default: false },
}, { _id: false });

// ── USER ──────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true, minlength: 6, select: false },
  role:      { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
  isActive:  { type: Boolean, default: true },
  avatar:    { type: String, default: '' },
  lastLogin: { type: Date },
}, { timestamps: true });
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = function(p) { return bcrypt.compare(p, this.password); };

// ── SLIDE ─────────────────────────────────────────────────────────────────────
const miniTitleWordSchema = new mongoose.Schema({
  text:  { type: String, default: '' },
  color: { type: String, default: '#ffffff' },
}, { _id: false });

const slideSchema = new mongoose.Schema({
  page:            { type: String, required: true, enum: ['home','about','services','portfolio','workshops','blog','faq','contact','quote','navbar','footer'] },
  title:           textStyleSchema,
  subtitle:        textStyleSchema,
  miniTitle:       textStyleSchema,
  miniTitleWords:  { type: [miniTitleWordSchema], default: [] }, // per-word color override
  paragraph:       textStyleSchema,
  imageUrl:    { type: String, default: '' },
  imageId:     { type: String, default: '' },
  mobileImageUrl: { type: String, default: '' },
  mobileImageId:  { type: String, default: '' },
  videoUrl:    { type: String, default: '' },
  linkUrl:     { type: String, default: '' },
  linkText:    { type: String, default: '' },
  position:    { type: String, default: 'center', enum: ['left','center','right','top-left','top-right','bottom-left','bottom-right','top-center','bottom-center'] },
  bgColor:     { type: String, default: '' },
  bgGradient:  { type: String, default: '' },
  overlayOpacity: { type: Number, default: 0.5 },
  order:       { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

// ── PRODUCT CATEGORY ──────────────────────────────────────────────────────────
const productCategorySchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, unique: true },
  description: { type: String, default: '' },
  imageUrl:    { type: String, default: '' },
  imageId:     { type: String, default: '' },
  color:       { type: String, default: '#c9a96e' },
  order:       { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

// ── PRODUCT ───────────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  slug:         { type: String, unique: true },
  category:     { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory', required: true },
  description:  { type: String, default: '' },
  shortDesc:    { type: String, default: '' },
  images:       [{ url: String, id: String, alt: String }],
  videos:       [{ url: String, id: String, title: String }],
  pdfs:         [{ url: String, id: String, title: String }],
  price:        { type: Number, default: 0 },
  mrp:          { type: Number, default: 0 },
  sku:          { type: String, default: '' },
  inStock:      { type: Boolean, default: true },
  isFeatured:   { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  tags:         [String],
  specifications: [{ key: String, value: String }],
  order:        { type: Number, default: 0 },
  isActive:     { type: Boolean, default: true },
  seo: { metaTitle: String, metaDescription: String, keywords: [String] },
  linkedServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
}, { timestamps: true });

// ── SERVICE ───────────────────────────────────────────────────────────────────
const serviceSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  slug:        { type: String, unique: true },
  category:    { type: String, default: 'Other', enum: ['Spaces','Industries','Products','People','Special Projects','Other'] },
  icon:        { type: String, default: '📸' },
  shortDesc:   { type: String, default: '' },
  description: { type: String, default: '' },
  imageUrl:    { type: String, default: '' },
  imageId:     { type: String, default: '' },
  features:    [String],
  order:       { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

// ── BLOG CATEGORY ─────────────────────────────────────────────────────────────
const blogCategorySchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  slug:     { type: String, unique: true },
  color:    { type: String, default: '#c9a96e' },
  order:    { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// ── BLOG ──────────────────────────────────────────────────────────────────────
const blogSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  slug:         { type: String, unique: true },
  category:     { type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory' },
  content:      { type: String, required: true },
  excerpt:      { type: String, default: '' },
  coverImage:   { url: String, id: String },
  author:       { type: String, default: 'Studio Jatin' },
  tags:         [String],
  isPublished:  { type: Boolean, default: false },
  publishedAt:  { type: Date },
  views:        { type: Number, default: 0 },
  isFeatured:   { type: Boolean, default: false },
  seo: { metaTitle: String, metaDescription: String },
  linkedServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
}, { timestamps: true });

// ── FAQ ───────────────────────────────────────────────────────────────────────
const faqSchema = new mongoose.Schema({
  question:  { type: String, required: true },
  answer:    { type: String, required: true },
  category:  { type: String, default: 'General' },
  order:     { type: Number, default: 0 },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

// ── WORKSHOP CATEGORY ─────────────────────────────────────────────────────────
const workshopCategorySchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  slug:     { type: String, unique: true },
  color:    { type: String, default: '#c9a96e' },
  order:    { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// ── WORKSHOP ──────────────────────────────────────────────────────────────────
const workshopSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  slug:        { type: String, unique: true },
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'WorkshopCategory' },
  description: { type: String, default: '' },
  content:     { type: String, default: '' },
  coverImage:  { url: String, id: String },
  date:        { type: Date },
  duration:    { type: String, default: '' },
  location:    { type: String, default: '' },
  seats:       { type: Number, default: 20 },
  price:       { type: Number, default: 0 },
  isFree:      { type: Boolean, default: false },
  isOnline:    { type: Boolean, default: false },
  isFeatured:  { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
  registrations: [{ name: String, email: String, phone: String, message: String, registeredAt: { type: Date, default: Date.now } }],
}, { timestamps: true });

// ── PORTFOLIO ─────────────────────────────────────────────────────────────────
const portfolioSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  slug:       { type: String, unique: true },
  category:   { type: String, required: true },
  imageUrl:   { type: String, required: true },
  imageId:    { type: String, default: '' },
  videoUrl:   { type: String, default: '' },
  description:{ type: String, default: '' },
  client:     { type: String, default: '' },
  year:       { type: String, default: '' },
  isFeatured: { type: Boolean, default: false },
  order:      { type: Number, default: 0 },
  isActive:   { type: Boolean, default: true },
  linkedServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
}, { timestamps: true });

// ── ENQUIRY ───────────────────────────────────────────────────────────────────
const enquirySchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true },
  phone:     { type: String, default: '' },
  company:   { type: String, default: '' },
  subject:   { type: String, default: '' },
  message:   { type: String, required: true },
  service:   { type: String, default: '' },
  fileUrl:   { type: String, default: '' },
  fileName:  { type: String, default: '' },
  type:      { type: String, enum: ['contact','quote','workshop','service'], default: 'contact' },
  status:    { type: String, enum: ['new','read','replied','closed'], default: 'new' },
  notes:     { type: String, default: '' },
  workshop:  { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop' },
}, { timestamps: true });

// ── MEDIA ─────────────────────────────────────────────────────────────────────
const mediaSchema = new mongoose.Schema({
  filename:     { type: String, required: true },
  originalName: { type: String, required: true },
  url:          { type: String, required: true },
  type:         { type: String, enum: ['image','video','pdf','document'], required: true },
  size:         { type: Number, default: 0 },
  mimeType:     { type: String, default: '' },
  alt:          { type: String, default: '' },
  folder:       { type: String, default: 'general' },
  uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ── SETTING ───────────────────────────────────────────────────────────────────
const settingSchema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
  group: { type: String, default: 'general' },
  label: { type: String, default: '' },
}, { timestamps: true });

// ── SEO ───────────────────────────────────────────────────────────────────────
const seoSchema = new mongoose.Schema({
  page:            { type: String, required: true, unique: true },
  metaTitle:       { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  keywords:        [String],
  ogImage:         { type: String, default: '' },
  canonical:       { type: String, default: '' },
}, { timestamps: true });

// ── TESTIMONIAL ───────────────────────────────────────────────────────────────
const testimonialSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  company:   { type: String, default: '' },
  role:      { type: String, default: '' },
  content:   { type: String, required: true },
  rating:    { type: Number, default: 5, min: 1, max: 5 },
  imageUrl:  { type: String, default: '' },
  isActive:  { type: Boolean, default: true },
  isFeatured:{ type: Boolean, default: false },
  order:     { type: Number, default: 0 },
}, { timestamps: true });

// ── BRAND (Trusted By) ────────────────────────────────────────────────────────
const brandSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  logoUrl:  { type: String, default: '' },
  logoId:   { type: String, default: '' },
  website:  { type: String, default: '' },
  order:    { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// ── SHOWCASE VIDEO ────────────────────────────────────────────────────────────
const showcaseVideoSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  videoUrl:    { type: String, required: true },
  videoId:     { type: String, default: '' },
  thumbnail:   { type: String, default: '' },
  description: { type: String, default: '' },
  order:       { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

// ── NOTE ──────────────────────────────────────────────────────────────────────
const noteSchema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true },
  content:    { type: String, default: '' },
  category:   { type: String, default: 'General', enum: ['General','Future Plans','Ideas','Tasks','Past Records','Meetings','Important','Personal'] },
  tags:       [{ type: String, trim: true }],
  color:      { type: String, default: '#ffffff' },
  isPinned:   { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = {
  User:              mongoose.model('User', userSchema),
  Slide:             mongoose.model('Slide', slideSchema),
  ProductCategory:   mongoose.model('ProductCategory', productCategorySchema),
  Product:           mongoose.model('Product', productSchema),
  Service:           mongoose.model('Service', serviceSchema),
  BlogCategory:      mongoose.model('BlogCategory', blogCategorySchema),
  Blog:              mongoose.model('Blog', blogSchema),
  FAQ:               mongoose.model('FAQ', faqSchema),
  WorkshopCategory:  mongoose.model('WorkshopCategory', workshopCategorySchema),
  Workshop:          mongoose.model('Workshop', workshopSchema),
  Portfolio:         mongoose.model('Portfolio', portfolioSchema),
  Enquiry:           mongoose.model('Enquiry', enquirySchema),
  Media:             mongoose.model('Media', mediaSchema),
  Setting:           mongoose.model('Setting', settingSchema),
  SEO:               mongoose.model('SEO', seoSchema),
  Testimonial:       mongoose.model('Testimonial', testimonialSchema),
  ShowcaseVideo:     mongoose.model('ShowcaseVideo', showcaseVideoSchema),
  Brand:             mongoose.model('Brand', brandSchema),
  Note:              mongoose.model('Note', noteSchema),
};

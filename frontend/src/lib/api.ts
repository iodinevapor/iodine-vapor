import axios from 'axios';
import Cookies from 'js-cookie';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
export const UPLOAD_URL = process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:5000';

export const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(cfg => {
  const token = Cookies.get('iv_token') || (typeof window !== 'undefined' ? localStorage.getItem('iv_token') : '');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401 && typeof window !== 'undefined') {
    Cookies.remove('iv_token'); localStorage.removeItem('iv_token');
    if (window.location.pathname.startsWith('/admin')) window.location.href = '/admin/login';
  }
  return Promise.reject(err);
});

export const imgUrl = (p?: string) => !p ? '' : p.startsWith('http') ? p : `${UPLOAD_URL}${p}`;

// ── SLIDES ────────────────────────────────────────────────────────────────────
export const slidesApi = {
  get:     (page?: string) => api.get('/slides', { params: { page } }).then(r => r.data.slides),
  getAll:  (page?: string) => api.get('/slides/admin', { params: { page } }).then(r => r.data.slides),
  create:  (d: any) => api.post('/slides', d).then(r => r.data.slide),
  update:  (id: string, d: any) => api.put(`/slides/${id}`, d).then(r => r.data.slide),
  delete:  (id: string) => api.delete(`/slides/${id}`),
  reorder: (orders: {id:string;order:number}[]) => api.put('/slides/reorder', { orders }),
};

// ── PRODUCT CATEGORIES ────────────────────────────────────────────────────────
export const prodCatsApi = {
  get:    () => api.get('/categories').then(r => r.data.categories),
  getAll: () => api.get('/categories/admin').then(r => r.data.categories),
  create: (d: any) => api.post('/categories', d).then(r => r.data.category),
  update: (id: string, d: any) => api.put(`/categories/${id}`, d).then(r => r.data.category),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// ── PRODUCTS ──────────────────────────────────────────────────────────────────
export const productsApi = {
  get:    (params?: any) => api.get('/products', { params }).then(r => r.data),
  getOne: (slug: string) => api.get(`/products/${slug}`).then(r => r.data.product),
  getAll: (params?: any) => api.get('/products/admin', { params }).then(r => r.data),
  create: (d: any) => api.post('/products', d).then(r => r.data.product),
  update: (id: string, d: any) => api.put(`/products/${id}`, d).then(r => r.data.product),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// ── SERVICES ──────────────────────────────────────────────────────────────────
export const servicesApi = {
  get:     () => api.get('/services').then(r => r.data.services),
  getOne:  (slug: string) => api.get(`/services/${slug}`).then(r => r.data),
  getAll:  () => api.get('/services/admin').then(r => r.data.services),
  create:  (d: any) => api.post('/services', d).then(r => r.data.service),
  update:  (id: string, d: any) => api.put(`/services/${id}`, d).then(r => r.data.service),
  delete:  (id: string) => api.delete(`/services/${id}`),
};

// ── BLOG CATEGORIES ───────────────────────────────────────────────────────────
export const blogCatsApi = {
  get:    () => api.get('/blog-categories').then(r => r.data.categories),
  getAll: () => api.get('/blog-categories/admin').then(r => r.data.categories),
  create: (d: any) => api.post('/blog-categories', d).then(r => r.data.category),
  update: (id: string, d: any) => api.put(`/blog-categories/${id}`, d).then(r => r.data.category),
  delete: (id: string) => api.delete(`/blog-categories/${id}`),
};

// ── BLOGS ─────────────────────────────────────────────────────────────────────
export const blogsApi = {
  get:    (params?: any) => api.get('/blogs', { params }).then(r => r.data),
  getOne: (slug: string) => api.get(`/blogs/${slug}`).then(r => r.data.blog),
  getAll: () => api.get('/blogs/admin').then(r => r.data.blogs),
  create: (d: any) => api.post('/blogs', d).then(r => r.data.blog),
  update: (id: string, d: any) => api.put(`/blogs/${id}`, d).then(r => r.data.blog),
  delete: (id: string) => api.delete(`/blogs/${id}`),
};

// ── FAQs ──────────────────────────────────────────────────────────────────────
export const faqsApi = {
  get:    () => api.get('/faqs').then(r => r.data.faqs),
  getAll: () => api.get('/faqs/admin').then(r => r.data.faqs),
  create: (d: any) => api.post('/faqs', d).then(r => r.data.faq),
  update: (id: string, d: any) => api.put(`/faqs/${id}`, d).then(r => r.data.faq),
  delete: (id: string) => api.delete(`/faqs/${id}`),
};

// ── WORKSHOP CATEGORIES ───────────────────────────────────────────────────────
export const wsCatsApi = {
  get:    () => api.get('/workshop-categories').then(r => r.data.categories),
  getAll: () => api.get('/workshop-categories/admin').then(r => r.data.categories),
  create: (d: any) => api.post('/workshop-categories', d).then(r => r.data.category),
  update: (id: string, d: any) => api.put(`/workshop-categories/${id}`, d).then(r => r.data.category),
  delete: (id: string) => api.delete(`/workshop-categories/${id}`),
};

// ── WORKSHOPS ─────────────────────────────────────────────────────────────────
export const workshopsApi = {
  get:      (params?: any) => api.get('/workshops', { params }).then(r => r.data.workshops),
  getOne:   (slug: string) => api.get(`/workshops/${slug}`).then(r => r.data.workshop),
  getAll:   () => api.get('/workshops/admin').then(r => r.data.workshops),
  create:   (d: any) => api.post('/workshops', d).then(r => r.data.workshop),
  update:   (id: string, d: any) => api.put(`/workshops/${id}`, d).then(r => r.data.workshop),
  delete:   (id: string) => api.delete(`/workshops/${id}`),
  register: (id: string, d: any) => api.post(`/workshops/${id}/register`, d),
};

// ── PORTFOLIO ─────────────────────────────────────────────────────────────────
export const portfolioApi = {
  get:    (params?: any) => api.get('/portfolio', { params }).then(r => r.data.portfolio),
  getAll: () => api.get('/portfolio/admin').then(r => r.data.portfolio),
  create: (d: any) => api.post('/portfolio', d).then(r => r.data.item),
  update: (id: string, d: any) => api.put(`/portfolio/${id}`, d).then(r => r.data.item),
  delete: (id: string) => api.delete(`/portfolio/${id}`),
};

// ── ENQUIRIES ─────────────────────────────────────────────────────────────────
export const enquiriesApi = {
  submit: (d: any) => {
    const fd = new FormData();
    Object.entries(d).forEach(([k, v]) => { if (v !== undefined && v !== null && k !== 'file') fd.append(k, String(v)); });
    if (d.file) fd.append('file', d.file);
    return api.post('/enquiries', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },
  get:    (params?: any) => api.get('/enquiries', { params }).then(r => r.data),
  update: (id: string, d: any) => api.put(`/enquiries/${id}`, d).then(r => r.data),
  delete: (id: string) => api.delete(`/enquiries/${id}`),
};

// ── MEDIA ─────────────────────────────────────────────────────────────────────
export const mediaApi = {
  upload: (file: File, alt?: string) => {
    const fd = new FormData(); fd.append('file', file); if (alt) fd.append('alt', alt);
    return api.post('/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data.media);
  },
  get:    (params?: any) => api.get('/media', { params }).then(r => r.data),
  update: (id: string, alt: string) => api.put(`/media/${id}`, { alt }).then(r => r.data.media),
  delete: (id: string) => api.delete(`/media/${id}`),
};

// ── SETTINGS ──────────────────────────────────────────────────────────────────
export const settingsApi = {
  get:  () => api.get('/settings').then(r => r.data.settings),
  save: (settings: any[]) => api.post('/settings/bulk', { settings }),
  set:  (key: string, value: any, group = 'general', label = '') => api.post('/settings', { key, value, group, label }),
};

// ── SEO ───────────────────────────────────────────────────────────────────────
export const seoApi = {
  getPage: (page: string) => api.get(`/seo/${page}`).then(r => r.data.seo),
  getAll:  () => api.get('/seo').then(r => r.data.seos),
  upsert:  (page: string, d: any) => api.put(`/seo/${page}`, d).then(r => r.data.seo),
};

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (d: any) => api.post('/auth/login', d).then(r => r.data),
  me:       () => api.get('/auth/me').then(r => r.data.user),
  update:   (d: any) => api.put('/auth/me', d).then(r => r.data.user),
  changePw: (d: any) => api.put('/auth/change-password', d),
  createAdmin:(d: any) => api.post('/auth/create-admin', d).then(r => r.data),
  admins:   () => api.get('/auth/admins').then(r => r.data.users),
  toggle:   (id: string) => api.put(`/auth/toggle/${id}`),
  dashboard:() => api.get('/auth/dashboard').then(r => r.data),
};

// ── TESTIMONIALS ──────────────────────────────────────────────────────────────
export const testimonialsApi = {
  get:    () => api.get('/testimonials').then(r => r.data.testimonials),
  getAll: () => api.get('/testimonials/admin').then(r => r.data.testimonials),
  create: (d: any) => api.post('/testimonials', d).then(r => r.data.testimonial),
  update: (id: string, d: any) => api.put(`/testimonials/${id}`, d).then(r => r.data.testimonial),
  delete: (id: string) => api.delete(`/testimonials/${id}`),
};

// ── SHOWCASE VIDEOS ───────────────────────────────────────────────────────────
export const showcaseVideosApi = {
  get:    () => api.get('/showcase-videos').then(r => r.data.videos),
  getAll: () => api.get('/showcase-videos/admin').then(r => r.data.videos),
  create: (d: any) => api.post('/showcase-videos', d).then(r => r.data.video),
  update: (id: string, d: any) => api.put(`/showcase-videos/${id}`, d).then(r => r.data.video),
  delete: (id: string) => api.delete(`/showcase-videos/${id}`),
};

// ── BRANDS ────────────────────────────────────────────────────────────────────
export const brandsApi = {
  get:    () => api.get('/brands').then(r => r.data.brands),
  getAll: () => api.get('/brands/admin').then(r => r.data.brands),
  create: (d: any) => api.post('/brands', d).then(r => r.data.brand),
  update: (id: string, d: any) => api.put(`/brands/${id}`, d).then(r => r.data.brand),
  delete: (id: string) => api.delete(`/brands/${id}`),
  reorder:(orders: {id:string;order:number}[]) => api.put('/brands/reorder', { orders }),
};

// ── NOTES ─────────────────────────────────────────────────────────────────────
export const notesApi = {
  get:    (params?: any) => api.get('/notes', { params }).then(r => r.data.notes),
  create: (d: any)       => api.post('/notes', d).then(r => r.data.note),
  update: (id: string, d: any) => api.put(`/notes/${id}`, d).then(r => r.data.note),
  delete: (id: string)   => api.delete(`/notes/${id}`),
};

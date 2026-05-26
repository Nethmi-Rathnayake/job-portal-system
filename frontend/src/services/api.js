// src/services/api.js
// Axios instance connected to PHP backend at localhost:8000

import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('jp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally — clear token and redirect
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('jp_token')
      localStorage.removeItem('jp_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  registerStudent: (data)  => API.post('/auth/register/student', data),
  registerCompany: (data)  => API.post('/auth/register/company', data),
  login:           (data)  => API.post('/auth/login', data),
  logout:          ()      => API.post('/auth/logout'),
  me:              ()      => API.get('/auth/me'),
}

// ── Jobs ─────────────────────────────────────────────────────
export const jobsAPI = {
  getAll:       (params)       => API.get('/jobs', { params }),
  getFeatured:  (limit = 6)    => API.get('/jobs/featured', { params: { limit } }),
  getById:      (id)           => API.get(`/jobs/${id}`),
  getMyJobs:    (params)       => API.get('/jobs/company', { params }),
  getMyStats:   ()             => API.get('/jobs/company/stats'),
  create:       (data)         => API.post('/jobs', data),
  update:       (id, data)     => API.put(`/jobs/${id}`, data),
  delete:       (id)           => API.delete(`/jobs/${id}`),
}

// ── Applications ─────────────────────────────────────────────
export const appAPI = {
  apply:          (data)       => API.post('/applications', data),
  myApplications: (params)     => API.get('/applications/my', { params }),
  myStats:        ()           => API.get('/applications/stats'),
  byJob:          (jobId, p)   => API.get(`/applications/job/${jobId}`, { params: p }),
  byCompany:      (params)     => API.get('/applications/company', { params }),
  updateStatus:   (id, data)   => API.patch(`/applications/${id}/status`, data),
  withdraw:       (id)         => API.delete(`/applications/${id}`),
}

// ── Users / Students ─────────────────────────────────────────
export const usersAPI = {
  getProfile:       ()         => API.get('/users/profile'),
  updateProfile:    (data)     => API.put('/users/profile', data),
  uploadImage:      (form)     => API.post('/users/profile/image', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword:   (data)     => API.put('/users/password', data),
}

// ── Companies ─────────────────────────────────────────────────
export const companiesAPI = {
  getAll:         (params)     => API.get('/companies', { params }),
  getById:        (id)         => API.get(`/companies/${id}`),
  getMyProfile:   ()           => API.get('/companies/profile'),
  updateProfile:  (data)       => API.put('/companies/profile', data),
  uploadLogo:     (form)       => API.post('/companies/logo', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data)       => API.put('/companies/password', data),
}

// ── Resumes ───────────────────────────────────────────────────
export const resumeAPI = {
  getAll:      ()              => API.get('/resumes'),
  upload:      (form)          => API.post('/resumes', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  setPrimary:  (id)            => API.patch(`/resumes/${id}/primary`),
  delete:      (id)            => API.delete(`/resumes/${id}`),
}

// ── Saved Jobs ────────────────────────────────────────────────
export const savedAPI = {
  getAll:  (params)            => API.get('/saved-jobs', { params }),
  save:    (job_id)            => API.post('/saved-jobs', { job_id }),
  unsave:  (jobId)             => API.delete(`/saved-jobs/${jobId}`),
  check:   (jobId)             => API.get(`/saved-jobs/check/${jobId}`),
}

// ── Admin ─────────────────────────────────────────────────────
export const adminAPI = {
  getStats:         ()         => API.get('/admin/stats'),
  getUsers:         (params)   => API.get('/admin/users', { params }),
  toggleUser:       (id)       => API.patch(`/admin/users/${id}/toggle`),
  deleteUser:       (id)       => API.delete(`/admin/users/${id}`),
  getCompanies:     (params)   => API.get('/admin/companies', { params }),
  verifyCompany:    (id)       => API.patch(`/admin/companies/${id}/verify`),
  deleteCompany:    (id)       => API.delete(`/admin/companies/${id}`),
  getJobs:          (params)   => API.get('/admin/jobs', { params }),
  toggleJob:        (id)       => API.patch(`/admin/jobs/${id}/toggle`),
  deleteJob:        (id)       => API.delete(`/admin/jobs/${id}`),
}

export default API

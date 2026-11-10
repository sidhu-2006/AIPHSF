import axios from 'axios'
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000
})
export const findNearbyHospitals = (data) => {
    return API.post('/hospitals/nearby' , data)
}
export const createEmergencyRequest = (data) => {
    return API.post('/emergencies', data)
}
export const sendAlert = (data) => {
    return API.post('/alerts', data)
}
export const getHospitals = () => {
    return API.get('/hospitals')
}
export default API
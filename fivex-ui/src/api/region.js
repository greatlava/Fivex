import { apiClient } from './auth'

const regionApi = {
  getRegions: () => {
    return apiClient.get('/regions')
  }
}

export default regionApi

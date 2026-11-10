const axios = require('axios')

const getMLScores = async (hospitals, emergencyType) => {
  try {
    const response = await axios({
      method: 'post',
      url: process.env.ML_SERVICE_URL || 'http://localhost:5001/score',
      data: {
        hospitals,
        emergencyType
      },
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    })

    if (response.data && response.data.success) {
      return {
        ranked: response.data.data,
        recommendation: response.data.recommendation
      }
    }

    return { ranked: hospitals, recommendation: hospitals[0] }

  } catch (error) {
    console.error('ML service error:', error.message)
    return { ranked: hospitals, recommendation: hospitals[0] }
  }
}

module.exports = { getMLScores }
<template>
  <div class="weather-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在获取天气信息...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>获取天气信息失败</h3>
      <p>{{ error }}</p>
      <button @click="fetchWeather" class="retry-btn">重试</button>
    </div>

    <!-- 天气信息展示 -->
    <div v-else-if="weatherData" class="weather-content">
      <!-- 当前天气 -->
      <div class="current-weather">
        <div class="location-info">
          <h2>{{ weatherData.location.city }}</h2>
          <p>{{ weatherData.location.name }}</p>
        </div>
        
        <div class="current-temp">
          <span class="temperature">{{ weatherData.now.temp }}°C</span>
          <span class="weather-desc">{{ weatherData.now.text }}</span>
        </div>
        
        <div class="weather-details">
          <div class="detail-item">
            <span class="label">体感温度</span>
            <span class="value">{{ weatherData.now.feels_like }}°C</span>
          </div>
          <div class="detail-item">
            <span class="label">湿度</span>
            <span class="value">{{ weatherData.now.rh }}%</span>
          </div>
          <div class="detail-item">
            <span class="label">风向</span>
            <span class="value">{{ weatherData.now.wind_dir }}</span>
          </div>
          <div class="detail-item">
            <span class="label">风力</span>
            <span class="value">{{ weatherData.now.wind_class }}</span>
          </div>
        </div>
      </div>

      <!-- 未来天气预报 -->
      <div class="forecast-section">
        <h3>未来天气</h3>
        <div class="forecast-list">
          <div 
            v-for="forecast in weatherData.forecasts.slice(0, 3)" 
            :key="forecast.date"
            class="forecast-item"
          >
            <div class="forecast-date">
              <span class="date">{{ formatDate(forecast.date) }}</span>
              <span class="week">{{ forecast.week }}</span>
            </div>
            <div class="forecast-weather">
              <span class="weather-text">{{ forecast.text_day }}</span>
              <div class="temp-range">
                <span class="high">{{ forecast.high }}°</span>
                <span class="low">{{ forecast.low }}°</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Location {
  country: string
  province: string
  city: string
  name: string
  id: string
}

interface CurrentWeather {
  temp: number
  feels_like: number
  rh: number
  wind_class: string
  wind_dir: string
  text: string
  vis: number
  aqi: number
}

interface WeatherForecast {
  date: string
  week: string
  high: number
  low: number
  text_day: string
  text_night: string
}

interface WeatherData {
  location: Location
  now: CurrentWeather
  forecasts: WeatherForecast[]
}

const loading = ref(true)
const error = ref('')
const weatherData = ref<WeatherData | null>(null)

// 获取天气数据
const fetchWeatherData = async (): Promise<WeatherData> => {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // 返回模拟数据
  return {
    location: {
      country: "中国",
      province: "北京市",
      city: "北京市",
      name: "东城",
      id: "110101"
    },
    now: {
      temp: 4,
      feels_like: 1,
      rh: 73,
      wind_class: "2级",
      wind_dir: "东风",
      text: "多云",
      vis: 3471,
      aqi: 140
    },
    forecasts: [
      {
        date: "2024-01-20",
        week: "星期六",
        high: 7,
        low: -2,
        text_day: "多云",
        text_night: "阴"
      },
      {
        date: "2024-01-21",
        week: "星期日",
        high: 11,
        low: 1,
        text_day: "多云",
        text_night: "晴"
      },
      {
        date: "2024-01-22",
        week: "星期一",
        high: 10,
        low: -2,
        text_day: "晴",
        text_night: "晴"
      }
    ]
  }
}

// 主要的获取天气函数
const fetchWeather = async () => {
  try {
    loading.value = true
    error.value = ''
    
    console.log('开始获取天气数据...')
    
    // 获取天气数据
    const data = await fetchWeatherData()
    
    console.log('天气数据获取成功:', data)
    
    weatherData.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取天气信息失败'
    console.error('获取天气信息失败:', err)
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 组件挂载时获取天气
onMounted(() => {
  console.log('WeatherDisplay组件已挂载，开始获取天气数据')
  fetchWeather()
})
</script>

<style scoped>
.weather-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  color: #dc2626;
  margin-bottom: 0.5rem;
}

.error-state p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.retry-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background: #2563eb;
}

/* 天气内容 */
.weather-content {
  display: grid;
  gap: 2rem;
}

/* 当前天气 */
.current-weather {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.location-info h2 {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.location-info p {
  opacity: 0.8;
  margin-bottom: 1.5rem;
}

.current-temp {
  text-align: center;
  margin-bottom: 2rem;
}

.temperature {
  display: block;
  font-size: 4rem;
  font-weight: 300;
  margin-bottom: 0.5rem;
}

.weather-desc {
  font-size: 1.25rem;
  opacity: 0.9;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  backdrop-filter: blur(10px);
}

.detail-item .label {
  opacity: 0.8;
  font-size: 0.875rem;
}

.detail-item .value {
  font-weight: 600;
}

/* 预报部分 */
.forecast-section {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.forecast-section h3 {
  margin-bottom: 1.5rem;
  color: #1f2937;
  font-size: 1.25rem;
}

.forecast-list {
  display: grid;
  gap: 1rem;
}

.forecast-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.forecast-item:hover {
  background: #e2e8f0;
}

.forecast-date {
  display: flex;
  flex-direction: column;
}

.forecast-date .date {
  font-weight: 600;
  color: #1f2937;
}

.forecast-date .week {
  font-size: 0.875rem;
  color: #6b7280;
}

.forecast-weather {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.weather-text {
  color: #4b5563;
}

.temp-range {
  display: flex;
  gap: 0.5rem;
}

.temp-range .high {
  font-weight: 600;
  color: #dc2626;
}

.temp-range .low {
  color: #6b7280;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .weather-container {
    padding: 0.5rem;
  }
  
  .current-weather {
    padding: 1.5rem;
  }
  
  .temperature {
    font-size: 3rem;
  }
  
  .weather-details {
    grid-template-columns: 1fr;
  }
  
  .forecast-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .forecast-weather {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
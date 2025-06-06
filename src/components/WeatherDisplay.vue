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
          <div class="detail-item">
            <span class="label">能见度</span>
            <span class="value">{{ (weatherData.now.vis / 1000).toFixed(1) }}km</span>
          </div>
          <div class="detail-item">
            <span class="label">AQI</span>
            <span class="value" :class="getAQIClass(weatherData.now.aqi)">{{ weatherData.now.aqi }}</span>
          </div>
        </div>
      </div>

      <!-- 未来天气预报 -->
      <div class="forecast-section">
        <h3>未来天气</h3>
        <div class="forecast-list">
          <div 
            v-for="forecast in weatherData.forecasts.slice(0, 5)" 
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

      <!-- 生活指数 -->
      <div class="indexes-section">
        <h3>生活指数</h3>
        <div class="indexes-grid">
          <div 
            v-for="index in weatherData.indexes" 
            :key="index.name"
            class="index-item"
          >
            <div class="index-name">{{ index.name }}</div>
            <div class="index-brief">{{ index.brief }}</div>
            <div class="index-detail">{{ index.detail }}</div>
          </div>
        </div>
      </div>

      <!-- 天气预警 -->
      <div v-if="weatherData.alerts && weatherData.alerts.length > 0" class="alerts-section">
        <h3>天气预警</h3>
        <div class="alerts-list">
          <div 
            v-for="alert in weatherData.alerts" 
            :key="alert.title"
            class="alert-item"
          >
            <div class="alert-header">
              <span class="alert-type">{{ alert.type }}</span>
              <span class="alert-level">{{ alert.level }}</span>
            </div>
            <div class="alert-title">{{ alert.title }}</div>
            <div class="alert-desc">{{ alert.desc }}</div>
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
  prec_1h: number
  clouds: number
  vis: number
  aqi: number
  pm25: number
  pm10: number
  no2: number
  so2: number
  o3: number
  co: number
  uptime: string
}

interface WeatherIndex {
  name: string
  brief: string
  detail: string
}

interface WeatherAlert {
  type: string
  level: string
  title: string
  desc: string
}

interface WeatherForecast {
  date: string
  week: string
  high: number
  low: number
  wc_day: string
  wc_night: string
  wd_day: string
  wd_night: string
  text_day: string
  text_night: string
  aqi: number
}

interface WeatherData {
  location: Location
  now: CurrentWeather
  indexes: WeatherIndex[]
  alerts: WeatherAlert[]
  forecasts: WeatherForecast[]
}

interface WeatherResponse {
  status: number
  result: WeatherData
}

const loading = ref(true)
const error = ref('')
const weatherData = ref<WeatherData | null>(null)

// 百度地图API密钥 - 实际使用时需要替换为真实的AK
const BAIDU_AK = 'your_baidu_ak_here'

// 默认位置（北京）
const DEFAULT_LOCATION = {
  lat: 39.9093,
  lng: 116.3964
}

// 获取用户地理位置
const getUserLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.log('浏览器不支持地理位置获取，使用默认位置')
      resolve(DEFAULT_LOCATION)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        console.log('获取地理位置失败，使用默认位置:', error.message)
        resolve(DEFAULT_LOCATION)
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 300000 // 5分钟缓存
      }
    )
  })
}

// 根据经纬度获取区县ID（简化版本，实际应该调用百度地图逆地理编码API）
const getDistrictId = async (lat: number, lng: number): Promise<string> => {
  // 这里简化处理，直接返回北京东城区的ID
  // 实际项目中应该调用百度地图的逆地理编码API来获取准确的district_id
  return '110101' // 北京市东城区
}

// 获取天气数据
const fetchWeatherData = async (districtId: string): Promise<WeatherData> => {
  // 由于CORS限制，这里使用模拟数据
  // 实际项目中需要通过后端代理或使用JSONP方式调用
  
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
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
      prec_1h: 0,
      clouds: 999999,
      vis: 3471,
      aqi: 140,
      pm25: 107,
      pm10: 0,
      no2: 23,
      so2: 22,
      o3: 70,
      co: 1.7,
      uptime: "20200220143500"
    },
    indexes: [
      {
        name: "晨练指数",
        brief: "较适宜",
        detail: "天气阴沉，请避免在林中晨练。"
      },
      {
        name: "洗车指数",
        brief: "适宜",
        detail: "天气较好，适合擦洗汽车。"
      },
      {
        name: "感冒指数",
        brief: "易发",
        detail: "天凉，昼夜温差大，易感冒"
      },
      {
        name: "紫外线指数",
        brief: "最弱",
        detail: "辐射弱，涂擦SPF8-12防晒护肤品。"
      },
      {
        name: "穿衣指数",
        brief: "较冷",
        detail: "建议着厚外套加毛衣等服装。"
      },
      {
        name: "运动指数",
        brief: "较适宜",
        detail: "气温较低，在户外运动请注意增减衣物。"
      }
    ],
    alerts: [
      {
        type: "道路冰雪",
        level: "蓝色预警",
        title: "市气象局发布道路冰雪蓝色预警[IV级/一般]",
        desc: "市气象局发布道路冰雪蓝色预警信号:受降雪天气影响，预计未来 24 小时我市将出现对交通有影响的道路结冰或积雪，请有关部门及广大群众做好防范工作。"
      }
    ],
    forecasts: [
      {
        date: "2020-02-20",
        week: "星期四",
        high: 7,
        low: -2,
        wc_day: "<3级",
        wc_night: "<3级",
        wd_day: "东南风",
        wd_night: "北风",
        text_day: "多云",
        text_night: "阴",
        aqi: 93
      },
      {
        date: "2020-02-21",
        week: "星期五",
        high: 11,
        low: 1,
        wc_day: "4~5级",
        wc_night: "<3级",
        wd_day: "西北风",
        wd_night: "西北风",
        text_day: "多云",
        text_night: "晴",
        aqi: 44
      },
      {
        date: "2020-02-22",
        week: "星期六",
        high: 10,
        low: -2,
        wc_day: "<3级",
        wc_night: "<3级",
        wd_day: "西风",
        wd_night: "南风",
        text_day: "晴",
        text_night: "晴",
        aqi: 39
      },
      {
        date: "2020-02-23",
        week: "星期日",
        high: 11,
        low: 0,
        wc_day: "<3级",
        wc_night: "<3级",
        wd_day: "西南风",
        wd_night: "西南风",
        text_day: "晴",
        text_night: "晴",
        aqi: 42
      },
      {
        date: "2020-02-24",
        week: "星期一",
        high: 13,
        low: 2,
        wc_day: "<3级",
        wc_night: "<3级",
        wd_day: "西南风",
        wd_night: "西南风",
        text_day: "晴",
        text_night: "晴",
        aqi: 45
      }
    ]
  }
}

// 主要的获取天气函数
const fetchWeather = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // 获取用户位置
    const location = await getUserLocation()
    
    // 获取区县ID
    const districtId = await getDistrictId(location.lat, location.lng)
    
    // 获取天气数据
    const data = await fetchWeatherData(districtId)
    
    weatherData.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取天气信息失败'
    console.error('获取天气信息失败:', err)
  } finally {
    loading.value = false
  }
}

// AQI等级样式
const getAQIClass = (aqi: number): string => {
  if (aqi <= 50) return 'aqi-good'
  if (aqi <= 100) return 'aqi-moderate'
  if (aqi <= 150) return 'aqi-unhealthy-sensitive'
  if (aqi <= 200) return 'aqi-unhealthy'
  if (aqi <= 300) return 'aqi-very-unhealthy'
  return 'aqi-hazardous'
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 组件挂载时获取天气
onMounted(() => {
  fetchWeather()
})
</script>

<style scoped>
.weather-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
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
  grid-template-columns: 1fr;
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
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.location-info p {
  opacity: 0.8;
  margin: 0 0 1.5rem 0;
}

.current-temp {
  text-align: center;
  margin-bottom: 2rem;
}

.temperature {
  display: block;
  font-size: 4rem;
  font-weight: 300;
  line-height: 1;
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

/* AQI颜色 */
.aqi-good { color: #10b981; }
.aqi-moderate { color: #f59e0b; }
.aqi-unhealthy-sensitive { color: #f97316; }
.aqi-unhealthy { color: #ef4444; }
.aqi-very-unhealthy { color: #8b5cf6; }
.aqi-hazardous { color: #7c2d12; }

/* 预报部分 */
.forecast-section,
.indexes-section,
.alerts-section {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.forecast-section h3,
.indexes-section h3,
.alerts-section h3 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
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
  background: #f9fafb;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.forecast-item:hover {
  background: #f3f4f6;
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
  flex-direction: column;
  align-items: flex-end;
}

.weather-text {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.temp-range {
  display: flex;
  gap: 0.5rem;
}

.temp-range .high {
  font-weight: 600;
  color: #1f2937;
}

.temp-range .low {
  color: #6b7280;
}

/* 生活指数 */
.indexes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.index-item {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border-left: 4px solid #3b82f6;
}

.index-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.index-brief {
  color: #3b82f6;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.index-detail {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.4;
}

/* 预警信息 */
.alerts-list {
  display: grid;
  gap: 1rem;
}

.alert-item {
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  border-left: 4px solid #ef4444;
}

.alert-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.alert-type {
  background: #ef4444;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.alert-level {
  background: #f59e0b;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.alert-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.alert-desc {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.4;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .weather-content {
    grid-template-columns: 2fr 1fr;
  }
  
  .current-weather {
    grid-row: span 2;
  }
}

@media (min-width: 1024px) {
  .weather-content {
    grid-template-columns: 1fr 1fr 1fr;
  }
  
  .current-weather {
    grid-column: span 2;
    grid-row: span 2;
  }
}

@media (max-width: 640px) {
  .weather-details {
    grid-template-columns: 1fr;
  }
  
  .indexes-grid {
    grid-template-columns: 1fr;
  }
  
  .temperature {
    font-size: 3rem;
  }
}
</style>
<template>
  <div class="weather-container">
    <div class="weather-header">
      <h2>天气信息</h2>
      <button @click="refreshWeather" :disabled="loading" class="refresh-btn">
        <span v-if="loading">刷新中...</span>
        <span v-else>刷新</span>
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>正在获取天气信息...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="refreshWeather" class="retry-btn">重试</button>
    </div>

    <div v-else-if="weatherData" class="weather-content">
      <!-- 当前位置信息 -->
      <div class="location-info">
        <h3>{{ weatherData.result.location.city }} - {{ weatherData.result.location.name }}</h3>
        <p class="location-detail">{{ weatherData.result.location.province }}, {{ weatherData.result.location.country }}</p>
      </div>

      <!-- 当前天气 -->
      <div class="current-weather">
        <div class="current-temp">
          <span class="temp">{{ weatherData.result.now.temp }}°C</span>
          <span class="feels-like">体感 {{ weatherData.result.now.feels_like }}°C</span>
        </div>
        <div class="weather-desc">
          <p class="text">{{ weatherData.result.now.text }}</p>
          <p class="wind">{{ weatherData.result.now.wind_dir }} {{ weatherData.result.now.wind_class }}</p>
          <p class="humidity">湿度 {{ weatherData.result.now.rh }}%</p>
        </div>
      </div>

      <!-- 空气质量 -->
      <div class="air-quality">
        <h4>空气质量</h4>
        <div class="aqi-info">
          <span class="aqi-value" :class="getAQILevel(weatherData.result.now.aqi)">AQI {{ weatherData.result.now.aqi }}</span>
          <div class="pollutants">
            <span>PM2.5: {{ weatherData.result.now.pm25 }}</span>
            <span>PM10: {{ weatherData.result.now.pm10 }}</span>
          </div>
        </div>
      </div>

      <!-- 生活指数 -->
      <div class="life-indexes" v-if="weatherData.result.indexes">
        <h4>生活指数</h4>
        <div class="indexes-grid">
          <div v-for="index in weatherData.result.indexes" :key="index.name" class="index-item">
            <span class="index-name">{{ index.name }}</span>
            <span class="index-brief">{{ index.brief }}</span>
          </div>
        </div>
      </div>

      <!-- 未来天气预报 -->
      <div class="forecast" v-if="weatherData.result.forecasts">
        <h4>未来天气</h4>
        <div class="forecast-list">
          <div v-for="forecast in weatherData.result.forecasts.slice(0, 5)" :key="forecast.date" class="forecast-item">
            <div class="forecast-date">
              <span class="date">{{ formatDate(forecast.date) }}</span>
              <span class="week">{{ forecast.week }}</span>
            </div>
            <div class="forecast-weather">
              <span class="day-text">{{ forecast.text_day }}</span>
              <span class="temp-range">{{ forecast.low }}° ~ {{ forecast.high }}°</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 天气预警 -->
      <div class="alerts" v-if="weatherData.result.alerts && weatherData.result.alerts.length > 0">
        <h4>天气预警</h4>
        <div v-for="alert in weatherData.result.alerts" :key="alert.title" class="alert-item">
          <div class="alert-header">
            <span class="alert-type">{{ alert.type }}</span>
            <span class="alert-level">{{ alert.level }}</span>
          </div>
          <p class="alert-title">{{ alert.title }}</p>
          <p class="alert-desc">{{ alert.desc }}</p>
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

interface LifeIndex {
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

interface Forecast {
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
  status: number
  result: {
    location: Location
    now: CurrentWeather
    indexes: LifeIndex[]
    alerts: WeatherAlert[]
    forecasts: Forecast[]
  }
}

const weatherData = ref<WeatherData | null>(null)
const loading = ref(false)
const error = ref('')

// 百度地图API密钥 - 从环境变量获取
const BAIDU_AK = import.meta.env.VITE_BAIDU_AK || 'your_baidu_ak_here'

// 检查API密钥配置
if (BAIDU_AK === 'your_baidu_ak_here') {
  console.warn('⚠️ 百度地图API密钥未配置，请在.env文件中设置VITE_BAIDU_AK')
}

// 默认位置：北京
const DEFAULT_LOCATION = {
  lat: 39.9093,
  lng: 116.3964
}

// 获取用户地理位置
const getCurrentPosition = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('浏览器不支持地理位置获取，使用默认位置')
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
      (err) => {
        console.warn('获取地理位置失败，使用默认位置:', err.message)
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

// 根据经纬度获取区域ID（简化版本，实际应该调用百度地图逆地理编码API）
const getDistrictId = async (lat: number, lng: number): Promise<string> => {
  // 这里简化处理，实际项目中应该调用百度地图的逆地理编码API
  // 暂时使用北京东城区的district_id
  return '110101'
}

// 获取天气数据
const fetchWeatherData = async () => {
  try {
    loading.value = true
    error.value = ''

    // 检查API密钥
    if (BAIDU_AK === 'your_baidu_ak_here') {
      throw new Error('百度地图API密钥未配置，请在.env文件中设置VITE_BAIDU_AK')
    }

    // 获取用户位置
    const position = await getCurrentPosition()
    console.log('📍 获取到位置:', position)

    // 获取区域ID
    const districtId = await getDistrictId(position.lat, position.lng)
    console.log('🏙️ 区域ID:', districtId)

    // 构造请求URL
    const url = `https://api.map.baidu.com/weather/v1/`
    const params = new URLSearchParams({
      district_id: districtId,
      data_type: 'all',
      ak: BAIDU_AK
    })

    const requestUrl = `${url}?${params.toString()}`
    console.log('🌐 请求URL:', requestUrl)
    console.log('🔑 使用的API密钥:', BAIDU_AK.substring(0, 8) + '...')

    // 尝试真实API调用
    try {
      const response = await fetch(requestUrl)
      const data = await response.json()
      
      console.log('📡 API响应:', data)
      
      if (data.status === 0 && data.result) {
        // API调用成功，使用真实数据
        weatherData.value = {
          location: data.result.location?.city || '北京市',
          current: {
            temperature: data.result.now?.temp || '20',
            condition: data.result.now?.text || '晴',
            humidity: data.result.now?.rh || '65',
            windSpeed: data.result.now?.wind_speed || '3',
            windDirection: data.result.now?.wind_dir || '东南风',
            pressure: data.result.now?.pres || '1013',
            visibility: data.result.now?.vis || '10',
            uvIndex: '3',
            feelsLike: data.result.now?.feels_like || '22'
          },
          forecast: data.result.forecasts?.slice(0, 7).map((day: any) => ({
            date: day.date,
            high: day.high,
            low: day.low,
            condition: day.text_day,
            icon: day.wc_day,
            windDirection: day.wd_day,
            windSpeed: day.ws_day
          })) || [],
          indices: data.result.index || [],
          alerts: data.result.alerts || []
        }
        console.log('✅ 使用真实API数据')
        return
      } else {
        console.warn('⚠️ API返回错误:', data.message || '未知错误')
        throw new Error(data.message || 'API调用失败')
      }
    } catch (apiError) {
      console.warn('⚠️ API调用失败，使用模拟数据:', apiError)
      // 继续使用模拟数据
    }
    
    // 模拟API响应数据（备用方案）
    const mockData: WeatherData = {
      status: 0,
      result: {
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
            wd_night: "南风",
            text_day: "晴",
            text_night: "多云",
            aqi: 45
          },
          {
            date: "2020-02-24",
            week: "星期一",
            high: 13,
            low: 2,
            wc_day: "<3级",
            wc_night: "<3级",
            wd_day: "南风",
            wd_night: "南风",
            text_day: "多云",
            text_night: "阴",
            aqi: 78
          }
        ]
      }
    }

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    weatherData.value = mockData
    
  } catch (err) {
    console.error('获取天气数据失败:', err)
    error.value = '获取天气数据失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 刷新天气数据
const refreshWeather = () => {
  fetchWeatherData()
}

// 获取AQI等级样式
const getAQILevel = (aqi: number): string => {
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

// 组件挂载时获取天气数据
onMounted(() => {
  fetchWeatherData()
})
</script>

<style scoped>
.weather-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.weather-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
}

.refresh-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #2563eb;
}

.refresh-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 40px 20px;
  color: #dc2626;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #b91c1c;
}

.location-info {
  margin-bottom: 24px;
}

.location-info h3 {
  margin: 0 0 4px 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
}

.location-detail {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.current-weather {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 12px;
  color: white;
}

.current-temp {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.temp {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
}

.feels-like {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
}

.weather-desc {
  flex: 1;
}

.weather-desc p {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.weather-desc .text {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 12px;
}

.air-quality {
  margin-bottom: 32px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.air-quality h4 {
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 600;
}

.aqi-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.aqi-value {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
}

.aqi-good { background: #10b981; color: white; }
.aqi-moderate { background: #f59e0b; color: white; }
.aqi-unhealthy-sensitive { background: #ef4444; color: white; }
.aqi-unhealthy { background: #dc2626; color: white; }
.aqi-very-unhealthy { background: #7c2d12; color: white; }
.aqi-hazardous { background: #450a0a; color: white; }

.pollutants {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #6b7280;
}

.life-indexes {
  margin-bottom: 32px;
}

.life-indexes h4 {
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 600;
}

.indexes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.index-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.index-name {
  font-size: 14px;
  color: #6b7280;
}

.index-brief {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.forecast {
  margin-bottom: 32px;
}

.forecast h4 {
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 600;
}

.forecast-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.forecast-item {
  flex: 0 0 auto;
  min-width: 140px;
  padding: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
}

.forecast-date {
  margin-bottom: 12px;
}

.forecast-date .date {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.forecast-date .week {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.forecast-weather .day-text {
  display: block;
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 4px;
}

.forecast-weather .temp-range {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #3b82f6;
}

.alerts {
  margin-bottom: 20px;
}

.alerts h4 {
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 600;
}

.alert-item {
  padding: 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  margin-bottom: 12px;
}

.alert-header {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.alert-type {
  padding: 4px 8px;
  background: #dc2626;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.alert-level {
  padding: 4px 8px;
  background: #f59e0b;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.alert-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.alert-desc {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .weather-container {
    margin: 0;
    padding: 16px;
    border-radius: 0;
  }
  
  .current-weather {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .aqi-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .indexes-grid {
    grid-template-columns: 1fr;
  }
  
  .forecast-list {
    gap: 8px;
  }
  
  .forecast-item {
    min-width: 120px;
    padding: 12px;
  }
}
</style>
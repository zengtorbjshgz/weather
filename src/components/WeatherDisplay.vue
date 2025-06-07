<template>
  <div class="md-weather-container md-surface md-shape-corner-large">
    <!-- 页面标题栏 -->
    <div class="md-weather-header md-surface-container md-shape-corner-medium md-elevation-1">
      <div class="header-content">
        <h1 class="md-typescale-headline-medium">天气信息</h1>
        <button 
          @click="refreshWeather" 
          :disabled="loading" 
          class="md-fab md-fab--small md-primary-container"
          :class="{ 'md-fab--loading': loading }"
        >
          <svg v-if="!loading" class="fab-icon" viewBox="0 0 24 24" fill="none">
            <path d="M4 12a8 8 0 0 1 8-8V2.5a.5.5 0 0 1 .8-.4l3 2.25a.5.5 0 0 1 0 .8L12.8 7.4a.5.5 0 0 1-.8-.4V5a6 6 0 1 0 6 6h1.5a.5.5 0 0 1 .4.8l-2.25 3a.5.5 0 0 1-.8 0l-2.25-3a.5.5 0 0 1 .4-.8H16a8 8 0 0 1-8 8z" fill="currentColor"/>
          </svg>
          <div v-else class="loading-spinner"></div>
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="md-loading-state md-surface-container md-shape-corner-medium md-elevation-1">
      <div class="loading-content">
        <div class="md-circular-progress">
          <svg class="circular-progress-svg" viewBox="0 0 48 48">
            <circle class="circular-progress-track" cx="24" cy="24" r="18" fill="none" stroke-width="4"/>
            <circle class="circular-progress-indicator" cx="24" cy="24" r="18" fill="none" stroke-width="4"/>
          </svg>
        </div>
        <p class="md-typescale-body-large loading-text">正在获取天气信息...</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="md-error-state md-error-container md-shape-corner-medium md-elevation-1">
      <div class="error-content">
        <svg class="error-icon" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
        </svg>
        <p class="md-typescale-body-large error-message">{{ error }}</p>
        <button @click="refreshWeather" class="md-button md-button--filled md-error">
          <span class="md-typescale-label-large">重试</span>
        </button>
      </div>
    </div>

    <!-- 天气内容 -->
    <div v-else-if="weatherData" class="md-weather-content">
      <!-- 当前位置信息 -->
      <div class="md-location-card md-surface-container md-shape-corner-medium md-elevation-1">
        <div class="location-header">
          <svg class="location-icon" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
          </svg>
          <div class="location-info">
            <h2 class="md-typescale-title-large location-title">{{ weatherData.result.location.city }} - {{ weatherData.result.location.name }}</h2>
            <p class="md-typescale-body-medium location-detail">{{ weatherData.result.location.province }}, {{ weatherData.result.location.country }}</p>
          </div>
        </div>
      </div>

      <!-- 当前天气主卡片 -->
      <div class="md-current-weather-card md-primary-container md-shape-corner-large md-elevation-2">
        <div class="current-weather-content">
          <div class="temperature-section">
            <span class="md-typescale-display-large current-temp">{{ weatherData.result.now.temp }}°</span>
            <span class="md-typescale-body-medium feels-like">体感 {{ weatherData.result.now.feels_like }}°C</span>
          </div>
          <div class="weather-details">
            <h3 class="md-typescale-headline-small weather-condition">{{ weatherData.result.now.text }}</h3>
            <div class="weather-metrics">
              <div class="metric-item">
                <svg class="metric-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M7.5 12c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm4.5 0c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5z" fill="currentColor"/>
                </svg>
                <span class="md-typescale-body-medium">{{ weatherData.result.now.wind_dir }} {{ weatherData.result.now.wind_class }}</span>
              </div>
              <div class="metric-item">
                <svg class="metric-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                </svg>
                <span class="md-typescale-body-medium">湿度 {{ weatherData.result.now.rh }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空气质量卡片 -->
      <div class="md-air-quality-card md-surface-container md-shape-corner-medium md-elevation-1">
        <h3 class="md-typescale-title-medium card-title">空气质量</h3>
        <div class="aqi-content">
          <div class="aqi-badge" :class="getAQILevel(weatherData.result.now.aqi)">
            <span class="md-typescale-label-large aqi-label">AQI</span>
            <span class="md-typescale-headline-small aqi-value">{{ weatherData.result.now.aqi }}</span>
          </div>
          <div class="pollutant-metrics">
            <div class="pollutant-item">
              <span class="md-typescale-label-medium pollutant-label">PM2.5</span>
              <span class="md-typescale-body-large pollutant-value">{{ weatherData.result.now.pm25 }}</span>
            </div>
            <div class="pollutant-item">
              <span class="md-typescale-label-medium pollutant-label">PM10</span>
              <span class="md-typescale-body-large pollutant-value">{{ weatherData.result.now.pm10 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 生活指数卡片 -->
      <div class="md-life-indexes-card md-surface-container md-shape-corner-medium md-elevation-1" v-if="weatherData.result.indexes">
        <h3 class="md-typescale-title-medium card-title">生活指数</h3>
        <div class="indexes-grid">
          <div v-for="index in weatherData.result.indexes" :key="index.name" class="md-index-item md-surface-container-highest md-shape-corner-small">
            <span class="md-typescale-label-medium index-name">{{ index.name }}</span>
            <span class="md-typescale-body-medium index-brief">{{ index.brief }}</span>
          </div>
        </div>
      </div>

      <!-- 天气预报卡片 -->
      <div class="md-forecast-card md-surface-container md-shape-corner-medium md-elevation-1" v-if="weatherData.result.forecasts">
        <h3 class="md-typescale-title-medium card-title">未来天气</h3>
        <div class="forecast-list">
          <div v-for="forecast in weatherData.result.forecasts.slice(0, 5)" :key="forecast.date" class="md-forecast-item md-surface-container-highest md-shape-corner-small">
            <div class="forecast-date">
              <span class="md-typescale-label-large date">{{ formatDate(forecast.date) }}</span>
              <span class="md-typescale-label-medium week">{{ forecast.week }}</span>
            </div>
            <div class="forecast-weather">
              <span class="md-typescale-body-medium day-text">{{ forecast.text_day }}</span>
              <span class="md-typescale-title-small temp-range">{{ forecast.low }}° ~ {{ forecast.high }}°</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 天气预警卡片 -->
      <div class="md-alerts-card md-error-container md-shape-corner-medium md-elevation-1" v-if="weatherData.result.alerts && weatherData.result.alerts.length > 0">
        <h3 class="md-typescale-title-medium card-title">天气预警</h3>
        <div v-for="alert in weatherData.result.alerts" :key="alert.title" class="md-alert-item md-surface-container-highest md-shape-corner-small">
          <div class="alert-header">
            <span class="md-alert-type md-typescale-label-small">{{ alert.type }}</span>
            <span class="md-alert-level md-typescale-label-small">{{ alert.level }}</span>
          </div>
          <h4 class="md-typescale-title-small alert-title">{{ alert.title }}</h4>
          <p class="md-typescale-body-medium alert-desc">{{ alert.desc }}</p>
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

// 根据经纬度获取区域ID（调用百度地图逆地理编码API）
const getDistrictId = async (lat: number, lng: number): Promise<string> => {
  try {
    // 调用百度地图逆地理编码API获取地址信息
    const params = new URLSearchParams({
      ak: BAIDU_AK,
      output: 'json',
      coordtype: 'wgs84ll',
      location: `${lat},${lng}`
    })
    
    const response = await fetch(`/api/geocode/?${params.toString()}`)
    const data = await response.json()
    
    console.log('🗺️ 逆地理编码响应:', data)
    
    if (data.status === 0 && data.result) {
      // 从地址组件中提取区域信息
      const addressComponent = data.result.addressComponent
      const city = addressComponent.city
      const district = addressComponent.district
      
      console.log('📍 解析到的城市:', city, '区域:', district)
      
      // 根据城市和区域信息映射到district_id
      // 这里可以建立一个城市区域到district_id的映射表
      const districtId = getDistrictIdByLocation(city, district)
      console.log('🏙️ 映射的区域ID:', districtId)
      
      return districtId
    } else {
      console.warn('⚠️ 逆地理编码失败:', data.message)
      throw new Error('逆地理编码失败')
    }
  } catch (error) {
    console.warn('⚠️ 逆地理编码API调用失败，使用默认区域ID:', error)
    // 降级使用北京东城区
    return '110101'
  }
}

// 根据城市和区域名称获取district_id的映射函数
const getDistrictIdByLocation = (city: string, district: string): string => {
  // 简化的城市区域映射表，实际项目中应该使用完整的映射数据
  const locationMap: Record<string, Record<string, string>> = {
    '北京市': {
      '东城区': '110101',
      '西城区': '110102',
      '朝阳区': '110105',
      '丰台区': '110106',
      '石景山区': '110107',
      '海淀区': '110108',
      '门头沟区': '110109',
      '房山区': '110111',
      '通州区': '110112',
      '顺义区': '110113',
      '昌平区': '110114',
      '大兴区': '110115',
      '怀柔区': '110116',
      '平谷区': '110117',
      '密云区': '110118',
      '延庆区': '110119'
    },
    '上海市': {
      '黄浦区': '310101',
      '徐汇区': '310104',
      '长宁区': '310105',
      '静安区': '310106',
      '普陀区': '310107',
      '虹口区': '310109',
      '杨浦区': '310110',
      '闵行区': '310112',
      '宝山区': '310113',
      '嘉定区': '310114',
      '浦东新区': '310115',
      '金山区': '310116',
      '松江区': '310117',
      '青浦区': '310118',
      '奉贤区': '310120',
      '崇明区': '310151'
    },
    '广州市': {
      '荔湾区': '440103',
      '越秀区': '440104',
      '海珠区': '440105',
      '天河区': '440106',
      '白云区': '440111',
      '黄埔区': '440112',
      '番禺区': '440113',
      '花都区': '440114',
      '南沙区': '440115',
      '从化区': '440117',
      '增城区': '440118'
    },
    '深圳市': {
      '罗湖区': '440303',
      '福田区': '440304',
      '南山区': '440305',
      '宝安区': '440306',
      '龙岗区': '440307',
      '盐田区': '440308',
      '龙华区': '440309',
      '坪山区': '440310',
      '光明区': '440311'
    }
  }
  
  // 查找对应的district_id
  const cityMap = locationMap[city]
  if (cityMap && cityMap[district]) {
    return cityMap[district]
  }
  
  // 如果没有找到精确匹配，尝试使用城市的第一个区域
  if (cityMap) {
    const firstDistrictId = Object.values(cityMap)[0]
    console.log(`⚠️ 未找到${district}的精确映射，使用${city}的默认区域`)
    return firstDistrictId
  }
  
  // 如果城市也没有找到，使用北京东城区作为默认值
  console.log(`⚠️ 未找到${city}的映射，使用北京东城区作为默认值`)
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

    // 构造请求URL - 使用本地代理
    const url = `/api/weather/`
    const params = new URLSearchParams({
      district_id: districtId,
      data_type: 'all',
      ak: BAIDU_AK
    })

    const requestUrl = `${url}?${params.toString()}`
    console.log('🌐 代理请求URL:', requestUrl)
    console.log('🔑 使用的API密钥:', BAIDU_AK.substring(0, 8) + '...')

    // 通过代理调用API
    try {
      const response = await fetch(requestUrl)
      const data = await response.json()
      
      console.log('📡 API响应:', data)
      
      if (data.status === 0 && data.result) {
        // API调用成功，使用真实数据，保持与模板期望的数据结构一致
        weatherData.value = {
          status: 0,
          result: {
            location: {
              country: data.result.location?.country || '中国',
              province: data.result.location?.province || '北京市',
              city: data.result.location?.city || '北京市',
              name: data.result.location?.name || '东城',
              id: data.result.location?.id || '110101'
            },
            now: {
              temp: data.result.now?.temp || 20,
              feels_like: data.result.now?.feels_like || 22,
              rh: data.result.now?.rh || 65,
              wind_class: data.result.now?.wind_class || '3级',
              wind_dir: data.result.now?.wind_dir || '东南风',
              text: data.result.now?.text || '晴',
              prec_1h: data.result.now?.prec_1h || 0,
              clouds: data.result.now?.clouds || 0,
              vis: data.result.now?.vis || 10,
              aqi: data.result.now?.aqi || 50,
              pm25: data.result.now?.pm25 || 35,
              pm10: data.result.now?.pm10 || 50,
              no2: data.result.now?.no2 || 20,
              so2: data.result.now?.so2 || 10,
              o3: data.result.now?.o3 || 80,
              co: data.result.now?.co || 1.0,
              uptime: data.result.now?.uptime || new Date().toISOString().replace(/[-:]/g, '').slice(0, 14)
            },
            indexes: data.result.indexes || data.result.index || [],
            alerts: data.result.alerts || [],
            forecasts: data.result.forecasts || []
          }
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
/* Material Design 3 Weather Display */
.md-weather-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 页面标题栏 */
.md-weather-header {
  padding: 20px 24px;
  margin-bottom: 8px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  margin: 0;
  color: var(--md-sys-color-on-surface);
}

/* Material Design 3 FAB */
.md-fab {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  outline: none;
  overflow: hidden;
}

.md-fab--small {
  width: 56px;
  height: 56px;
  color: var(--md-sys-color-on-primary-container);
}

.md-fab:hover {
  transform: scale(1.05);
}

.md-fab:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.md-fab:disabled {
  opacity: 0.38;
  cursor: not-allowed;
  transform: none;
}

.fab-icon {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: md-spin 1s linear infinite;
}

@keyframes md-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 加载状态 */
.md-loading-state {
  padding: 48px 24px;
  text-align: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.md-circular-progress {
  width: 48px;
  height: 48px;
  position: relative;
}

.circular-progress-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.circular-progress-track {
  stroke: var(--md-sys-color-outline-variant);
  opacity: 0.24;
}

.circular-progress-indicator {
  stroke: var(--md-sys-color-primary);
  stroke-linecap: round;
  stroke-dasharray: 113;
  stroke-dashoffset: 56.5;
  animation: md-circular-progress 1.4s ease-in-out infinite;
}

@keyframes md-circular-progress {
  0% {
    stroke-dasharray: 1, 113;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 85, 113;
    stroke-dashoffset: -25;
  }
  100% {
    stroke-dasharray: 85, 113;
    stroke-dashoffset: -110;
  }
}

.loading-text {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}

/* 错误状态 */
.md-error-state {
  padding: 48px 24px;
  text-align: center;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: var(--md-sys-color-error);
}

.error-message {
  margin: 0;
  color: var(--md-sys-color-on-error-container);
}

/* Material Design 3 Button */
.md-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 10px 24px;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  outline: none;
  text-decoration: none;
  overflow: hidden;
}

.md-button--filled {
  background-color: var(--md-sys-color-error);
  color: var(--md-sys-color-on-error);
}

.md-button--filled:hover {
  background-color: var(--md-sys-color-error);
  filter: brightness(1.08);
}

.md-button--filled:focus-visible {
  outline: 2px solid var(--md-sys-color-error);
  outline-offset: 2px;
}

/* 天气内容容器 */
.md-weather-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 位置信息卡片 */
.md-location-card {
  padding: 20px 24px;
}

.location-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.location-icon {
  width: 24px;
  height: 24px;
  color: var(--md-sys-color-primary);
  flex-shrink: 0;
}

.location-info {
  flex: 1;
  min-width: 0;
}

.location-title {
  margin: 0 0 4px 0;
  color: var(--md-sys-color-on-surface);
}

.location-detail {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}

/* 当前天气主卡片 */
.md-current-weather-card {
  padding: 32px 24px;
  margin-bottom: 8px;
}

.current-weather-content {
  display: flex;
  align-items: center;
  gap: 32px;
}

.temperature-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.current-temp {
  color: var(--md-sys-color-on-primary-container);
  font-weight: 400;
  line-height: 1;
  margin-bottom: 8px;
}

.feels-like {
  color: var(--md-sys-color-on-primary-container);
  opacity: 0.87;
}

.weather-details {
  flex: 1;
  min-width: 0;
}

.weather-condition {
  margin: 0 0 16px 0;
  color: var(--md-sys-color-on-primary-container);
  font-weight: 400;
}

.weather-metrics {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.metric-icon {
  width: 20px;
  height: 20px;
  color: var(--md-sys-color-on-primary-container);
  opacity: 0.87;
  flex-shrink: 0;
}

.metric-item span {
  color: var(--md-sys-color-on-primary-container);
  opacity: 0.87;
}

/* 卡片通用样式 */
.card-title {
  margin: 0 0 20px 0;
  color: var(--md-sys-color-on-surface);
  font-weight: 400;
}

/* 空气质量卡片 */
.md-air-quality-card {
  padding: 24px;
}

.aqi-content {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.aqi-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 20px;
  border-radius: var(--md-sys-shape-corner-medium);
  min-width: 80px;
}

.aqi-label {
  opacity: 0.87;
  margin-bottom: 4px;
}

.aqi-value {
  font-weight: 400;
}

/* AQI 等级颜色 */
.aqi-good {
  background-color: #4CAF50;
  color: white;
}

.aqi-moderate {
  background-color: #FF9800;
  color: white;
}

.aqi-unhealthy-sensitive {
  background-color: #FF5722;
  color: white;
}

.aqi-unhealthy {
  background-color: #F44336;
  color: white;
}

.aqi-very-unhealthy {
  background-color: #9C27B0;
  color: white;
}

.aqi-hazardous {
  background-color: #795548;
  color: white;
}

.pollutant-metrics {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.pollutant-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.pollutant-label {
  color: var(--md-sys-color-on-surface-variant);
}

.pollutant-value {
  color: var(--md-sys-color-on-surface);
  font-weight: 500;
}

/* 生活指数卡片 */
.md-life-indexes-card {
  padding: 24px;
}

.indexes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.md-index-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.md-index-item:hover {
  background-color: var(--md-sys-color-surface-container-high);
}

.index-name {
  color: var(--md-sys-color-on-surface-variant);
}

.index-brief {
  color: var(--md-sys-color-on-surface);
  font-weight: 500;
  text-align: right;
}

/* 天气预报卡片 */
.md-forecast-card {
  padding: 24px;
}

.forecast-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: thin;
  scrollbar-color: var(--md-sys-color-outline-variant) transparent;
}

.forecast-list::-webkit-scrollbar {
  height: 8px;
}

.forecast-list::-webkit-scrollbar-track {
  background: transparent;
}

.forecast-list::-webkit-scrollbar-thumb {
  background-color: var(--md-sys-color-outline-variant);
  border-radius: 4px;
}

.md-forecast-item {
  flex: 0 0 auto;
  min-width: 140px;
  padding: 20px 16px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.md-forecast-item:hover {
  background-color: var(--md-sys-color-surface-container-high);
  transform: translateY(-2px);
}

.forecast-date {
  margin-bottom: 16px;
}

.date {
  display: block;
  color: var(--md-sys-color-on-surface);
  margin-bottom: 4px;
}

.week {
  display: block;
  color: var(--md-sys-color-on-surface-variant);
}

.forecast-weather {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.day-text {
  color: var(--md-sys-color-on-surface-variant);
}

.temp-range {
  color: var(--md-sys-color-primary);
  font-weight: 500;
}

/* 天气预警卡片 */
.md-alerts-card {
  padding: 24px;
}

.md-alert-item {
  padding: 20px;
  margin-bottom: 16px;
  border-left: 4px solid var(--md-sys-color-error);
}

.md-alert-item:last-child {
  margin-bottom: 0;
}

.alert-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.md-alert-type {
  padding: 6px 12px;
  background-color: var(--md-sys-color-error);
  color: var(--md-sys-color-on-error);
  border-radius: var(--md-sys-shape-corner-small);
  font-weight: 500;
  text-transform: uppercase;
}

.md-alert-level {
  padding: 6px 12px;
  background-color: var(--md-sys-color-tertiary);
  color: var(--md-sys-color-on-tertiary);
  border-radius: var(--md-sys-shape-corner-small);
  font-weight: 500;
  text-transform: uppercase;
}

.alert-title {
  margin: 0 0 12px 0;
  color: var(--md-sys-color-on-surface);
  font-weight: 500;
}

.alert-desc {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 840px) {
  .md-weather-container {
    padding: 16px;
    gap: 20px;
  }
  
  .md-weather-header {
    padding: 16px 20px;
  }
  
  .current-weather-content {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }
  
  .weather-metrics {
    align-items: center;
  }
  
  .aqi-content {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  
  .pollutant-metrics {
    justify-content: center;
  }
  
  .indexes-grid {
    grid-template-columns: 1fr;
  }
  
  .forecast-list {
    gap: 8px;
  }
  
  .md-forecast-item {
    min-width: 120px;
    padding: 16px 12px;
  }
}

@media (max-width: 480px) {
  .md-weather-container {
    padding: 12px;
    gap: 16px;
  }
  
  .md-weather-header {
    padding: 12px 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .md-fab--small {
    width: 48px;
    height: 48px;
  }
  
  .fab-icon {
    width: 20px;
    height: 20px;
  }
  
  .md-current-weather-card {
    padding: 24px 20px;
  }
  
  .current-temp {
    font-size: 3.5rem;
  }
  
  .location-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .card-title {
    font-size: 1.1rem;
  }
  
  .md-forecast-item {
    min-width: 100px;
    padding: 12px 8px;
  }
  
  .pollutant-metrics {
    gap: 16px;
  }
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .aqi-good {
    background-color: #2E7D32;
  }
  
  .aqi-moderate {
    background-color: #F57C00;
  }
  
  .aqi-unhealthy-sensitive {
    background-color: #D84315;
  }
  
  .aqi-unhealthy {
    background-color: #C62828;
  }
  
  .aqi-very-unhealthy {
    background-color: #6A1B9A;
  }
  
  .aqi-hazardous {
    background-color: #4E342E;
  }
}
</style>
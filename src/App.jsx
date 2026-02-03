import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { Layout, Menu, Button, message } from 'antd'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import ScriptUploadPage from './pages/ScriptUploadPage'
import ScriptListPage from './pages/ScriptListPage'
import ScriptDetailPage from './pages/ScriptDetailPage'
import RequestPage from './pages/RequestPage'
import CollectionPage from './pages/CollectionPage'
import StatsPage from './pages/StatsPage'
import AuthGuard from './components/AuthGuard'
import axios from 'axios'
import './App.css'

const { Header, Content, Footer } = Layout

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  // 配置axios拦截器
  useEffect(() => {
    // 请求拦截器
    const requestInterceptor = axios.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      error => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    const responseInterceptor = axios.interceptors.response.use(
      response => {
        return response
      },
      error => {
        if (error.response && error.response.status === 401) {
          // 认证失效，清除本地存储并跳转到登录页
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setIsAuthenticated(false)
          setUser(null)
          message.error('登录已过期，请重新登录')
          navigate('/login')
        } else if (error.response) {
          // 其他错误，显示错误信息
          message.error(error.response.data.error || '请求失败')
        } else {
          // 网络错误
          message.error('网络错误，请稍后重试')
        }
        return Promise.reject(error)
      }
    )

    return () => {
      // 清理拦截器
      axios.interceptors.request.eject(requestInterceptor)
      axios.interceptors.response.eject(responseInterceptor)
    }
  }, [navigate])

  // 检查登录状态
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const userInfo = localStorage.getItem('user')
      if (token && userInfo) {
        setIsAuthenticated(true)
        setUser(JSON.parse(userInfo))
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    }
    checkAuth()
  }, [])

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
    navigate('/login')
  }

  return (
    <Layout className="layout">
      <Header>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['home']}
          style={{ flex: 1, minWidth: 0 }}
        >
          <Menu.Item key="home">
            <Link to="/">首页</Link>
          </Menu.Item>
          <Menu.Item key="scripts">
            <Link to="/scripts">剧本列表</Link>
          </Menu.Item>
          {isAuthenticated ? (
            <>
              <Menu.Item key="profile">
                <Link to="/profile">个人主页</Link>
              </Menu.Item>
              {user?.type === 'scriptwriter' && (
                <Menu.Item key="upload">
                  <Link to="/upload">上传剧本</Link>
                </Menu.Item>
              )}
              <Menu.Item key="collections">
                <Link to="/collections">我的收藏</Link>
              </Menu.Item>
              <Menu.Item key="requests">
                <Link to="/requests">对接请求</Link>
              </Menu.Item>
              <Menu.Item key="stats">
                <Link to="/stats">数据统计</Link>
              </Menu.Item>
              <Menu.Item key="logout">
                <Button type="text" danger onClick={handleLogout}>退出登录</Button>
              </Menu.Item>
            </>
          ) : (
            <>
              <Menu.Item key="login">
                <Link to="/login">登录</Link>
              </Menu.Item>
              <Menu.Item key="register">
                <Link to="/register">注册</Link>
              </Menu.Item>
            </>
          )}
        </Menu>
      </Header>
      <Content style={{ padding: '0 50px', marginTop: 24, marginBottom: 24 }}>
        <div className="site-layout-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/scripts" element={<ScriptListPage />} />
            <Route path="/script/:id" element={<ScriptDetailPage />} />
            <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
            <Route path="/upload" element={<AuthGuard requiredRoles={['scriptwriter']}><ScriptUploadPage /></AuthGuard>} />
            <Route path="/collections" element={<AuthGuard><CollectionPage /></AuthGuard>} />
            <Route path="/requests" element={<AuthGuard><RequestPage /></AuthGuard>} />
            <Route path="/stats" element={<AuthGuard><StatsPage /></AuthGuard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        编剧个人主页与剧本分类查询平台 ©{new Date().getFullYear()} Created by TraeAI
      </Footer>
    </Layout>
  )
}

export default App
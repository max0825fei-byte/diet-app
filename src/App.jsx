import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import DietHomePage from './pages/DietHomePage'
import './App.css'

const { Header, Content, Footer } = Layout

function App() {
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
            <Link to="/">减肥饮食管理</Link>
          </Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '0 50px', marginTop: 24, marginBottom: 24 }}>
        <div className="site-layout-content">
          <Routes>
            <Route path="/" element={<DietHomePage />} />
          </Routes>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        减肥饮食管理应用 ©{new Date().getFullYear()} Created by TraeAI
      </Footer>
    </Layout>
  )
}

export default App
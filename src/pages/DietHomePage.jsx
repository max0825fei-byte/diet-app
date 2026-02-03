import React, { useState, useEffect } from 'react';
import { Input, Button, Select, Card, Progress, Modal, Form, message } from 'antd';
import './DietHomePage.css';
import { foodDatabase } from '../data/foodDatabase';
import { storageService } from '../services/storageService';

const { Option } = Select;
const { Search } = Input;

const DietHomePage = () => {
  // 状态管理
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodModalVisible, setFoodModalVisible] = useState(false);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [customFoodModalVisible, setCustomFoodModalVisible] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState('中量');
  const [todayRecords, setTodayRecords] = useState([]);
  const [dailyCalorieLimit, setDailyCalorieLimit] = useState(1200);
  const [totalCalories, setTotalCalories] = useState(0);
  const [remainingCalories, setRemainingCalories] = useState(1200);
  const [customFoodName, setCustomFoodName] = useState('');
  const [customFoodCalories, setCustomFoodCalories] = useState('');
  const [customFoods, setCustomFoods] = useState([]);

  // 初始化数据
  useEffect(() => {
    // 加载当日记录
    const records = storageService.getTodayRecords();
    setTodayRecords(records);

    // 加载每日热量限制
    const limit = storageService.getDailyCalorieLimit();
    if (limit) {
      setDailyCalorieLimit(limit);
    }

    // 加载自定义食物
    const foods = storageService.getCustomFoods();
    setCustomFoods(foods);

    // 计算总热量
    calculateTotalCalories(records, limit || 1200);

    // 初始加载所有食物
    setFilteredFoods([...foodDatabase, ...customFoods]);
  }, []);

  // 计算总热量
  const calculateTotalCalories = (records, limit) => {
    const total = records.reduce((sum, record) => sum + record.calories, 0);
    setTotalCalories(total);
    setRemainingCalories(limit - total);
  };

  // 搜索食物
  const handleSearch = (value) => {
    setSearchText(value);
    filterFoods(value, selectedCategory);
  };

  // 选择分类
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    filterFoods(searchText, value);
  };

  // 过滤食物
  const filterFoods = (text, category) => {
    let filtered = [...foodDatabase, ...customFoods];

    if (text) {
      filtered = filtered.filter(food => 
        food.name.toLowerCase().includes(text.toLowerCase())
      );
    }

    if (category) {
      filtered = filtered.filter(food => food.category === category);
    }

    setFilteredFoods(filtered);
  };

  // 查看食物详情
  const handleFoodClick = (food) => {
    setSelectedFood(food);
    setFoodModalVisible(true);
  };

  // 打开记录弹窗
  const handleRecordClick = () => {
    setRecordModalVisible(true);
  };

  // 记录食物
  const handleRecordFood = () => {
    if (!selectedFood) return;

    // 计算热量
    let calories;
    const amountMultiplier = {
      '少量': 0.7,
      '中量': 1,
      '大量': 1.5
    };

    if (selectedFood.commonPortion && selectedFood.commonPortion.length > 0) {
      calories = Math.round(selectedFood.commonPortion[0].calories * amountMultiplier[selectedAmount]);
    } else {
      calories = Math.round(selectedFood.calories * 100 * amountMultiplier[selectedAmount] / 100);
    }

    // 创建记录
    const record = {
      id: Date.now().toString(),
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      amount: selectedAmount,
      calories: calories,
      time: new Date().toLocaleTimeString()
    };

    // 保存记录
    const updatedRecords = [...todayRecords, record];
    storageService.saveTodayRecords(updatedRecords);
    setTodayRecords(updatedRecords);

    // 更新统计
    calculateTotalCalories(updatedRecords, dailyCalorieLimit);

    // 关闭弹窗
    setRecordModalVisible(false);
    setFoodModalVisible(false);

    message.success('记录成功！');
  };

  // 添加自定义食物
  const handleAddCustomFood = () => {
    if (!customFoodName || !customFoodCalories) {
      message.error('请输入食物名称和热量');
      return;
    }

    // 创建自定义食物
    const newCustomFood = {
      id: `custom-${Date.now()}`,
      name: customFoodName,
      category: '自定义',
      calories: parseInt(customFoodCalories),
      commonPortion: [{
        name: '100g',
        weight: 100,
        calories: parseInt(customFoodCalories)
      }]
    };

    // 保存自定义食物
    const updatedCustomFoods = [...customFoods, newCustomFood];
    storageService.saveCustomFoods(updatedCustomFoods);
    setCustomFoods(updatedCustomFoods);

    // 更新食物列表
    filterFoods(searchText, selectedCategory);

    // 关闭弹窗
    setCustomFoodModalVisible(false);
    setCustomFoodName('');
    setCustomFoodCalories('');

    message.success('自定义食物添加成功！');
  };

  // 更新每日热量限制
  const handleLimitChange = (value) => {
    setDailyCalorieLimit(value);
    storageService.saveDailyCalorieLimit(value);
    calculateTotalCalories(todayRecords, value);
    message.success('设置保存成功！');
  };

  // 渲染食物列表
  const renderFoodList = () => {
    return filteredFoods.map(food => (
      <Card
        key={food.id}
        className="food-card"
        onClick={() => handleFoodClick(food)}
      >
        <div className="food-name">{food.name}</div>
        <div className="food-calories">
          {food.commonPortion && food.commonPortion.length > 0 ? (
            `${food.commonPortion[0].name} ≈ ${food.commonPortion[0].calories} 大卡`
          ) : (
            `100g ≈ ${food.calories} 大卡`
          )}
        </div>
      </Card>
    ));
  };

  return (
    <div className="diet-home-page">
      <div className="header">
        <h1>减肥饮食管理</h1>
      </div>

      {/* 当日摄入统计 */}
      <div className="calorie-stats">
        <Card className="stats-card">
          <div className="stats-header">当日摄入统计</div>
          <div className="stats-content">
            <div className="calorie-item">
              <span className="label">已摄入:</span>
              <span className="value">{totalCalories} 大卡</span>
            </div>
            <div className="calorie-item">
              <span className="label">剩余:</span>
              <span className={`value ${remainingCalories < 0 ? 'exceeded' : ''}`}>
                {Math.max(0, remainingCalories)} 大卡
                {remainingCalories < 0 && ` (超标 ${Math.abs(remainingCalories)} 大卡)`}
              </span>
            </div>
            <Progress 
              percent={Math.min(100, (totalCalories / dailyCalorieLimit) * 100)} 
              status={remainingCalories < 0 ? 'exception' : 'normal'}
              strokeColor={remainingCalories < 0 ? '#ff4d4f' : '#52c41a'}
            />
            <div className="limit-setting">
              <span className="label">每日推荐摄入:</span>
              <Select 
                defaultValue={dailyCalorieLimit} 
                style={{ width: 120, marginLeft: 8 }} 
                onChange={handleLimitChange}
              >
                <Option value={1000}>1000 大卡</Option>
                <Option value={1200}>1200 大卡</Option>
                <Option value={1500}>1500 大卡</Option>
                <Option value={1800}>1800 大卡</Option>
                <Option value={2000}>2000 大卡</Option>
              </Select>
            </div>
          </div>
        </Card>
      </div>

      {/* 搜索和分类 */}
      <div className="search-section">
        <Search
          placeholder="搜索食物"
          allowClear
          enterButton="搜索"
          size="large"
          onSearch={handleSearch}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300, marginRight: 16 }}
        />
        <Select
          placeholder="选择分类"
          style={{ width: 120, marginRight: 16 }}
          onChange={handleCategoryChange}
          allowClear
        >
          <Option value="主食">主食</Option>
          <Option value="蔬菜">蔬菜</Option>
          <Option value="肉类">肉类</Option>
          <Option value="外卖">外卖</Option>
          <Option value="零食">零食</Option>
          <Option value="饮品">饮品</Option>
          <Option value="自定义">自定义</Option>
        </Select>
        <Button type="primary" onClick={() => setCustomFoodModalVisible(true)}>
          添加自定义食物
        </Button>
      </div>

      {/* 食物列表 */}
      <div className="food-list">
        {renderFoodList()}
      </div>

      {/* 食物详情弹窗 */}
      <Modal
        title={selectedFood?.name}
        open={foodModalVisible}
        onCancel={() => setFoodModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setFoodModalVisible(false)}>
            取消
          </Button>,
          <Button key="record" type="primary" onClick={() => setRecordModalVisible(true)}>
            一键记录
          </Button>
        ]}
      >
        {selectedFood && (
          <div className="food-detail">
            <div className="detail-item">
              <span className="label">分类:</span>
              <span className="value">{selectedFood.category}</span>
            </div>
            <div className="detail-item">
              <span className="label">100g 热量:</span>
              <span className="value">{selectedFood.calories} 大卡</span>
            </div>
            {selectedFood.commonPortion && selectedFood.commonPortion.map((portion, index) => (
              <div key={index} className="detail-item">
                <span className="label">{portion.name} 热量:</span>
                <span className="value">{portion.calories} 大卡</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* 记录食物弹窗 */}
      <Modal
        title="记录食物"
        open={recordModalVisible}
        onCancel={() => setRecordModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setRecordModalVisible(false)}>
            取消
          </Button>,
          <Button key="confirm" type="primary" onClick={handleRecordFood}>
            确认记录
          </Button>
        ]}
      >
        <div className="record-form">
          <div className="form-item">
            <span className="label">食物:</span>
            <span className="value">{selectedFood?.name}</span>
          </div>
          <div className="form-item">
            <span className="label">食用量:</span>
            <Select
              defaultValue="中量"
              style={{ width: 120, marginLeft: 8 }}
              onChange={setSelectedAmount}
            >
              <Option value="少量">少量</Option>
              <Option value="中量">中量</Option>
              <Option value="大量">大量</Option>
            </Select>
          </div>
        </div>
      </Modal>

      {/* 添加自定义食物弹窗 */}
      <Modal
        title="添加自定义食物"
        open={customFoodModalVisible}
        onCancel={() => setCustomFoodModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setCustomFoodModalVisible(false)}>
            取消
          </Button>,
          <Button key="confirm" type="primary" onClick={handleAddCustomFood}>
            保存
          </Button>
        ]}
      >
        <div className="custom-food-form">
          <div className="form-item">
            <span className="label">食物名称:</span>
            <Input
              placeholder="请输入食物名称"
              value={customFoodName}
              onChange={(e) => setCustomFoodName(e.target.value)}
              style={{ width: 200, marginLeft: 8 }}
            />
          </div>
          <div className="form-item">
            <span className="label">100g 热量:</span>
            <Input
              type="number"
              placeholder="请输入热量"
              value={customFoodCalories}
              onChange={(e) => setCustomFoodCalories(e.target.value)}
              style={{ width: 100, marginLeft: 8 }}
            />
            <span style={{ marginLeft: 8 }}>大卡</span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DietHomePage;
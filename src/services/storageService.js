// 存储服务 - 用于本地存储用户的饮食记录和设置

const STORAGE_KEYS = {
  TODAY_RECORDS: 'diet_today_records',
  DAILY_CALORIE_LIMIT: 'diet_daily_calorie_limit',
  CUSTOM_FOODS: 'diet_custom_foods'
};

// 获取今天的日期字符串 (YYYY-MM-DD)
const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 获取当日记录
export const getTodayRecords = () => {
  try {
    const today = getTodayDate();
    const storageKey = `${STORAGE_KEYS.TODAY_RECORDS}_${today}`;
    const recordsJson = localStorage.getItem(storageKey);
    return recordsJson ? JSON.parse(recordsJson) : [];
  } catch (error) {
    console.error('Error getting today records:', error);
    return [];
  }
};

// 保存当日记录
export const saveTodayRecords = (records) => {
  try {
    const today = getTodayDate();
    const storageKey = `${STORAGE_KEYS.TODAY_RECORDS}_${today}`;
    localStorage.setItem(storageKey, JSON.stringify(records));
    return true;
  } catch (error) {
    console.error('Error saving today records:', error);
    return false;
  }
};

// 获取每日热量限制
export const getDailyCalorieLimit = () => {
  try {
    const limitStr = localStorage.getItem(STORAGE_KEYS.DAILY_CALORIE_LIMIT);
    return limitStr ? parseInt(limitStr) : null;
  } catch (error) {
    console.error('Error getting daily calorie limit:', error);
    return null;
  }
};

// 保存每日热量限制
export const saveDailyCalorieLimit = (limit) => {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_CALORIE_LIMIT, String(limit));
    return true;
  } catch (error) {
    console.error('Error saving daily calorie limit:', error);
    return false;
  }
};

// 获取自定义食物
export const getCustomFoods = () => {
  try {
    const foodsJson = localStorage.getItem(STORAGE_KEYS.CUSTOM_FOODS);
    return foodsJson ? JSON.parse(foodsJson) : [];
  } catch (error) {
    console.error('Error getting custom foods:', error);
    return [];
  }
};

// 保存自定义食物
export const saveCustomFoods = (foods) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FOODS, JSON.stringify(foods));
    return true;
  } catch (error) {
    console.error('Error saving custom foods:', error);
    return false;
  }
};

// 清除过期记录（可选功能，用于清理历史数据）
export const clearExpiredRecords = () => {
  try {
    const today = getTodayDate();
    const keysToRemove = [];

    // 遍历所有存储键，找到过期的记录
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(`${STORAGE_KEYS.TODAY_RECORDS}_`)) {
        const dateStr = key.replace(`${STORAGE_KEYS.TODAY_RECORDS}_`, '');
        if (dateStr < today) {
          keysToRemove.push(key);
        }
      }
    }

    // 删除过期记录
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Error clearing expired records:', error);
    return false;
  }
};

export const storageService = {
  getTodayRecords,
  saveTodayRecords,
  getDailyCalorieLimit,
  saveDailyCalorieLimit,
  getCustomFoods,
  saveCustomFoods,
  clearExpiredRecords
};
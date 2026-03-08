<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="aside">
      <div class="logo">蓝莓管理系统</div>
      <el-menu
        default-active="/order"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/order">
          <el-icon><List /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/enum">
          <el-icon><Setting /></el-icon>
          <span>枚举管理</span>
        </el-menu-item>
        <el-menu-item index="/category">
          <el-icon><Menu /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/cost-template">
          <el-icon><Money /></el-icon>
          <span>成本模版</span>
        </el-menu-item>
        <el-menu-item index="/freight-template">
          <el-icon><Van /></el-icon>
          <span>运费模版</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-right">
          <span>管理员</span>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { List, Setting, Menu, Money, Van } from '@element-plus/icons-vue'
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.aside {
  background-color: #304156;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
}
.header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.header-right {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.main-content {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>

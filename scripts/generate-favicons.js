#!/usr/bin/env node

/**
 * 生成favicon的脚本
 * 需要安装 sharp: npm install sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 }
];

async function generateFavicons() {
  console.log('🎨 开始生成favicon...');
  
  const publicDir = path.join(__dirname, '../public');
  const svgPath = path.join(publicDir, 'favicon.svg');
  
  // 检查SVG文件是否存在
  if (!fs.existsSync(svgPath)) {
    console.error('❌ favicon.svg 文件不存在，请先创建SVG图标');
    return;
  }
  
  try {
    for (const { name, size } of sizes) {
      const outputPath = path.join(publicDir, name);
      
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ 生成 ${name} (${size}x${size})`);
    }
    
    console.log('🎉 所有favicon生成完成！');
  } catch (error) {
    console.error('❌ 生成favicon时出错:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  generateFavicons();
}

module.exports = { generateFavicons };
